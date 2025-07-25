from typing import Literal, get_args

from deepeval.metrics import BaseMetric, FaithfulnessMetric
from sqlalchemy.ext.asyncio import AsyncSession

from llm_eval.metrics.plugins.interface import (
    BaseConfiguration,
    BaseConfigurationCreate,
    BaseConfigurationRead,
    BaseConfigurationUpdate,
    MetricPlugin,
)
from llm_eval.metrics.plugins.utils import get_chat_model
from llm_eval.utils.deepeval_llm import DeepEvalChatModel
from llm_eval.utils.json_types import JSONObject

MetricType = Literal["FAITHFULNESS"]

METRIC_TYPE: MetricType = get_args(MetricType)[0]


class FaithfulnessMetricConfiguration(BaseConfiguration[MetricType]):
    threshold: float
    include_reason: bool
    strict_mode: bool
    chat_model_id: str


class FaithfulnessMetricConfigurationRead(BaseConfigurationRead[MetricType]):
    threshold: float
    include_reason: bool
    strict_mode: bool
    chat_model_id: str


class FaithfulnessMetricConfigurationCreate(BaseConfigurationCreate[MetricType]):
    threshold: float
    include_reason: bool
    strict_mode: bool
    chat_model_id: str


class FaithfulnessMetricConfigurationUpdate(BaseConfigurationUpdate[MetricType]):
    threshold: float | None = None
    include_reason: bool | None = None
    strict_mode: bool | None = None
    chat_model_id: str | None = None


class FaithfulnessMetricPlugin(
    MetricPlugin[
        MetricType,
        FaithfulnessMetricConfiguration,
        FaithfulnessMetricConfigurationRead,
        FaithfulnessMetricConfigurationCreate,
        FaithfulnessMetricConfigurationUpdate,
    ]
):
    def __init__(self) -> None:
        super().__init__(METRIC_TYPE)

    def configuration_from_db_json(
        self, json: JSONObject
    ) -> FaithfulnessMetricConfiguration:
        return FaithfulnessMetricConfiguration.model_validate(json)

    def configuration_from_create_data(
        self, create_configuration: FaithfulnessMetricConfigurationCreate
    ) -> FaithfulnessMetricConfiguration:
        return FaithfulnessMetricConfiguration.model_validate(
            create_configuration.model_dump()
        )

    def update_configuration(
        self,
        configuration: FaithfulnessMetricConfiguration,
        update_configuration: FaithfulnessMetricConfigurationUpdate,
    ) -> FaithfulnessMetricConfiguration:
        return (
            super()
            .update_configuration(configuration, update_configuration)
            .model_copy(
                update={
                    "threshold": update_configuration.threshold
                    if update_configuration.threshold is not None
                    else configuration.threshold,
                    "include_reason": update_configuration.include_reason
                    if update_configuration.include_reason is not None
                    else configuration.include_reason,
                    "strict_mode": update_configuration.strict_mode
                    if update_configuration.strict_mode is not None
                    else configuration.strict_mode,
                    "chat_model_id": update_configuration.chat_model_id
                    if update_configuration.chat_model_id is not None
                    else configuration.chat_model_id,
                }
            )
        )

    def create_read_model_from_configuration(
        self, configuration: FaithfulnessMetricConfiguration
    ) -> FaithfulnessMetricConfigurationRead:
        return FaithfulnessMetricConfigurationRead.model_validate(configuration)

    async def create_deepeval_metric(
        self, session: AsyncSession, configuration: FaithfulnessMetricConfiguration
    ) -> BaseMetric:
        return FaithfulnessMetric(
            threshold=configuration.threshold,
            include_reason=configuration.include_reason,
            strict_mode=configuration.strict_mode,
            model=DeepEvalChatModel(
                await get_chat_model(session, configuration.chat_model_id),
            ),
        )
