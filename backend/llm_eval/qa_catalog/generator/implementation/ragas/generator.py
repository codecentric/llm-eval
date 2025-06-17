import math
import traceback
from copy import copy
from hashlib import md5
from typing import Callable, Coroutine, get_args, override

from anyio import (
    CapacityLimiter,
    create_memory_object_stream,
    create_task_group,
)
from anyio.streams.memory import MemoryObjectSendStream
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from loguru import logger
from pydantic import ValidationError
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.testset import TestsetGenerator
from ragas.testset.graph import KnowledgeGraph, Node, NodeType
from ragas.testset.persona import Persona
from ragas.testset.synthesizers import (
    BaseSynthesizer,
    MultiHopAbstractQuerySynthesizer,
    MultiHopSpecificQuerySynthesizer,
    SingleHopSpecificQuerySynthesizer,
)
from ragas.testset.synthesizers.generate import LangchainLLMWrapper
from ragas.testset.synthesizers.testset_schema import Testset
from ragas.testset.transforms import apply_transforms, default_transforms
from ragas.testset.transforms.default import num_tokens_from_string

from llm_eval.qa_catalog.generator.implementation.QACatalogGeneratorTypes import (  # noqa: E501
    QACatalogGeneratorType,
    RagasGeneratorType,
)
from llm_eval.qa_catalog.generator.implementation.ragas.config import (
    RagasQACatalogGeneratorConfig,
    RagasQACatalogGeneratorModelConfig,
    RagasQACatalogQuerySynthesizer,
)
from llm_eval.qa_catalog.generator.implementation.ragas.helper import (
    ragas_sample_to_synthetic_qa_pair,
)
from llm_eval.qa_catalog.generator.interface import (
    AsyncQACatalogGeneratorSupport,
    QACatalogGenerator,
    QACatalogGeneratorDataSourceConfig,
    QACatalogGeneratorLocalModelConfig,
)
from llm_eval.qa_catalog.graph_utils import create_backup
from llm_eval.qa_catalog.synthetic_qa_pair import SyntheticQAPair
from llm_eval.settings import SETTINGS
from llm_eval.utils.decorators import retry_on_error
from llm_eval.utils.mixed_document_loader import MixedDocumentLoader
from llm_eval.utils.model_settings.azure_ai_model_settings import AzureAiModelSettings

query_synthesizer_classes: dict[
    RagasQACatalogQuerySynthesizer, type[BaseSynthesizer]
] = {
    RagasQACatalogQuerySynthesizer.SINGLE_HOP_SPECIFIC: SingleHopSpecificQuerySynthesizer,  # noqa: E501
    RagasQACatalogQuerySynthesizer.MULTI_HOP_SPECIFIC: MultiHopSpecificQuerySynthesizer,
    RagasQACatalogQuerySynthesizer.MULTI_HOP_ABSTRACT: MultiHopAbstractQuerySynthesizer,
}


class RagasQACatalogGenerator(
    QACatalogGenerator[
        RagasGeneratorType,
        RagasQACatalogGeneratorConfig,
        QACatalogGeneratorDataSourceConfig,
        RagasQACatalogGeneratorModelConfig | QACatalogGeneratorLocalModelConfig,
    ],
    AsyncQACatalogGeneratorSupport,
):
    generator_type: QACatalogGeneratorType = get_args(RagasGeneratorType)[0]

    @override
    def __init__(
        self,
        config: RagasQACatalogGeneratorConfig,
        data_source_config: QACatalogGeneratorDataSourceConfig,
        model_config: (
            RagasQACatalogGeneratorModelConfig | QACatalogGeneratorLocalModelConfig
        ),
    ) -> None:
        super().__init__(config, data_source_config, model_config)
        if isinstance(model_config, RagasQACatalogGeneratorModelConfig):
            self.llm = LangchainLLMWrapper(
                self.load_chat_model(model_config.llm_endpoint)
            )
        else:
            self.llm = LangchainLLMWrapper(model_config.llm)

        try:
            azure_settings = AzureAiModelSettings()  # type: ignore
        except ValidationError:
            _msg = "Invalid Azure OpenAI configuration for Ragas, see .env.example"
            logger.error(_msg)
            raise RuntimeError(_msg)

        self.embeddings = LangchainEmbeddingsWrapper(azure_settings.to_embeddings())
        if not self.config.knowledge_graph_location:
            self.config.knowledge_graph_location = (
                SETTINGS.file_upload_temp_location / "knowledge_graph_ragas.json"
            )

        self.validate_config()

        self.personas = (
            [
                Persona(name=p.name, role_description=p.description)
                for p in self.config.personas
            ]
            if self.config.personas
            else None
        )

    def validate_config(self) -> None:
        if sum(self.config.query_distribution.values()) != 1:
            raise ValueError(
                "Given query distribution for the generation is invalid, "
                "distribution weights should sum up to 1"
            )

    def _load_and_process_documents(self) -> list[Document]:
        """
        Loads and processes documents.
        Returns:
            A list of processed documents split by pages.
        """
        loader = DirectoryLoader(
            str(self.data_source_config.data_source_location),
            show_progress=True,
            glob=self.data_source_config.data_source_glob,
            loader_cls=MixedDocumentLoader,  # type: ignore
        )
        docs = loader.load()
        return docs

    def _create_document_nodes(self, docs: list[Document]) -> list[Node]:
        return [
            Node(
                type=NodeType.DOCUMENT,
                properties={
                    "page_content": doc.page_content,
                    "document_metadata": doc.metadata,
                    # nosemgrep
                    "page_hash": md5(
                        bytes(doc.page_content, encoding="utf-8")
                    ).hexdigest(),
                },
            )
            for doc in docs
        ]

    def _has_same_nodes(self, n1: list[Node], n2: list[Node]) -> bool:
        """
        Compares the nodes of given to knowledge graphs
        """

        def _sort(nodes: list[Node]) -> list[str]:
            # sort nodes by each pages hash
            return sorted(
                set(
                    filter(
                        lambda x: x,
                        map(lambda n: n.properties.get("page_hash", ""), nodes),
                    )
                )
            )

        _1 = _sort(n1)
        _2 = _sort(n2)

        return _1 == _2

    @staticmethod
    def split_documents(
        docs: list[Document],
    ) -> list[Document]:
        """
        A preprocessing step for ragas's default transforms.
        It cannot handle documents with token count > 100k
        Therefore if the document is large enough, we split it into proper subdocuments.

        """
        _docs = []
        split_occurred = False
        for doc in docs:
            token_length = num_tokens_from_string(doc.page_content)
            if token_length > 100_000:
                split_occurred = True
                chunk_size = math.ceil(token_length / 2)
                chunk_overlap = math.ceil(chunk_size * 0.5)
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap,
                    length_function=num_tokens_from_string,
                )
                _docs.extend(splitter.split_documents([doc]))
            else:
                _docs.append(doc)

        if split_occurred:
            return RagasQACatalogGenerator.split_documents(_docs)
        else:
            return _docs

    def apply_knowledge_graph_transformations(
        self, kg: KnowledgeGraph, docs: list[Document]
    ) -> None:
        apply_transforms(
            kg,
            default_transforms(
                self.split_documents(docs),
                llm=self.llm,
                embedding_model=self.embeddings,
            ),
        )

    def create_knowledge_graph(self) -> KnowledgeGraph:
        """
        Loads the knowledge graph if already exists
        and compares it's nodes with the current documents.
        If the existent graph has these documents already it uses the existent kg
        otherwise create a new kg out ouf the documents
        """

        docs = self._load_and_process_documents()  # chunks of documents
        if len(docs) == 0:
            raise RuntimeError("No documents found")

        loaded_knowledge_graph = self.load_knowledge_graph()
        new_nodes = self._create_document_nodes(docs)
        if loaded_knowledge_graph and self._has_same_nodes(
            loaded_knowledge_graph.nodes, new_nodes
        ):
            logger.info("Using the existent knowledge graph")
            kg = loaded_knowledge_graph
        else:
            logger.info("Generating a new knowledge graph")
            kg = KnowledgeGraph(nodes=new_nodes)
            self.apply_knowledge_graph_transformations(kg, docs)
            if self.config.knowledge_graph_location:
                create_backup(
                    self.config.knowledge_graph_location
                )  # backup the old kg config
                kg.save(
                    self.config.knowledge_graph_location
                )  # save the new kg to system
                logger.info(
                    f"Knowledge graph saved to {self.config.knowledge_graph_location}"
                )

        return kg

    def load_knowledge_graph(self) -> KnowledgeGraph | None:
        if not self.config.knowledge_graph_location:
            return None

        knowledge_graph: KnowledgeGraph | None = None

        if not self.config.knowledge_graph_location.exists():
            logger.info(
                f"No knowledge graph found at {self.config.knowledge_graph_location}"
            )
            return knowledge_graph

        logger.info(f"Knowledge graph found at {self.config.knowledge_graph_location}")
        try:
            knowledge_graph = KnowledgeGraph.load(self.config.knowledge_graph_location)
        except Exception as e:
            logger.error(f"Failed to load knowledge graph: {e.__class__.__name__}: {e}")
            self.config.knowledge_graph_location.replace(
                self.config.knowledge_graph_location.absolute().with_suffix(".bak")
            )

        return knowledge_graph

    @retry_on_error((Exception,), 3)
    def generate_testset(
        self,
        generator: TestsetGenerator,
        count: int,
    ) -> Testset:
        return generator.generate(
            count,
            query_distribution=[
                (query_synthesizer_classes[synthesizer_type](llm=self.llm), weight)
                for synthesizer_type, weight in self.config.query_distribution.items()
                if weight > 0
            ],
        )

    async def _generate_single_sample(
        self,
        generator: TestsetGenerator,
        send_sample: MemoryObjectSendStream[SyntheticQAPair],
        limiter: CapacityLimiter,
    ) -> None:
        try:
            async with limiter:
                testset = self.generate_testset(generator, 1)
                if testset.samples:
                    async with send_sample:
                        for testset_sample in testset.samples:
                            sample = ragas_sample_to_synthetic_qa_pair(testset_sample)
                            await send_sample.send(sample)
                else:
                    logger.error(f"empty testset {testset.samples} {testset.to_list()}")
        except Exception as e:
            logger.error(
                f"Error generating sample: {e}\nTraceback: {traceback.format_exc()}"
            )

    async def a_create_synthetic_qa(
        self,
        process_sample: Callable[[SyntheticQAPair], Coroutine],
    ) -> None:
        limiter = CapacityLimiter(SETTINGS.ragas.parallel_generation_limit)
        send_sample, receive_sample = create_memory_object_stream[SyntheticQAPair]()

        kg = self.create_knowledge_graph()

        logger.info(f"Generating {self.config.sample_count} QA pairs")

        generator = TestsetGenerator(
            llm=self.llm,
            embedding_model=self.embeddings,
            knowledge_graph=kg,
            persona_list=self.personas,
        )

        async with create_task_group() as tg:
            async with send_sample:
                for _ in range(self.config.sample_count):
                    tg.start_soon(
                        self._generate_single_sample,
                        copy(generator),
                        send_sample.clone(),
                        limiter,
                    )

            async with receive_sample:
                logger.info("Waiting for generated qa samples")
                async for sample in receive_sample:
                    await process_sample(sample)

        logger.info(f"Generated {self.config.sample_count} QA sample sets")

    @override
    @staticmethod
    def create_configuration_from_dict(
        _dict: dict,
    ) -> RagasQACatalogGeneratorConfig:
        return RagasQACatalogGeneratorConfig.model_validate(_dict)

    @override
    @staticmethod
    def create_model_configuration_from_kwargs(
        kwargs: dict,
    ) -> RagasQACatalogGeneratorModelConfig:
        return RagasQACatalogGeneratorModelConfig(**kwargs)
