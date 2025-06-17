from loguru import logger

from llm_eval.qa_catalog.models import QACatalogGenerationData
from llm_eval.tasks import app
from llm_eval.utils.task import async_task


def submit_generate_catalog_task(
    catalog_id: str, data: QACatalogGenerationData
) -> None:
    data_json: str = data.model_dump_json()
    # noinspection PyUnresolvedReferences
    execute_generate_catalog_task.si(catalog_id, data_json).delay()


@app.task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    max_retries=10,
)
@async_task
async def execute_generate_catalog_task(
    catalog_id: str,
    json_data: str,
) -> None:
    data: QACatalogGenerationData = QACatalogGenerationData.model_validate_json(
        json_data
    )
    logger.info(
        f"Start catalog generation: name={data.name}, catalog_id={catalog_id} ..."
    )
    from llm_eval.qa_catalog.logic.generation import generate_catalog

    await generate_catalog(catalog_id, data)
