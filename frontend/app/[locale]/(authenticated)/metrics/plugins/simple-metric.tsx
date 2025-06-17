import { useTranslations } from "next-intl";
import { z } from "zod";

import { LlmEndpointAutocomplete } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-autocomplete";
import {
  BaseMetricType,
  configurationDataWithChatModelShape,
  ConfigurationFormProps,
  createMetricPlugin,
  MetricConfiguration,
  TypeMetric,
} from "@/app/[locale]/(authenticated)/metrics/plugins/plugin-definition";
import { endpointValueItem } from "@/app/[locale]/(authenticated)/metrics/plugins/shared-details";
import { FormAutocomplete } from "@/app/[locale]/components/form-autocomplete";
import { FormSwitch } from "@/app/[locale]/components/form-switch";
import { createListValueItem } from "@/app/[locale]/components/property-list";
import { formErrors } from "@/app/utils/form-errors";

export type SimpleMetricType = Extract<
  BaseMetricType,
  "ANSWER_RELEVANCY" | "HALLUCINATION" | "FAITHFULNESS"
>;

const simpleConfigurationDataShape = {
  ...configurationDataWithChatModelShape,
  includeReason: z.boolean({ required_error: formErrors.required }),
} satisfies z.ZodRawShape;

export type SimpleMetricConfiguration<Type extends SimpleMetricType> = {
  type: Type;
  getDefaults: MetricConfiguration<
    Type,
    typeof simpleConfigurationDataShape
  >["getDefaults"];
};

export const createSimpleMetricPlugin = <Type extends SimpleMetricType>({
  type,
  getDefaults,
}: SimpleMetricConfiguration<Type>) =>
  createMetricPlugin({
    type,
    configurationDataShape: simpleConfigurationDataShape,
    getDefaults,
    configurationForm: SimpleMetricWithChatModelConfigurationForm,
    getDetailItems: (metric: TypeMetric<SimpleMetricType>, t) => [
      createListValueItem({
        label: t("MetricDetails.labels.includeReason"),
        value: metric.configuration.includeReason,
        fullWidth: true,
      }),
      endpointValueItem(metric.configuration.chatModelId, t),
    ],
  });

const SimpleMetricWithChatModelConfigurationForm = ({
  control,
}: ConfigurationFormProps<
  SimpleMetricType,
  typeof simpleConfigurationDataShape
>) => {
  const t = useTranslations();

  return (
    <>
      <FormSwitch
        name="includeReason"
        control={control}
        className="col-start-1"
      >
        {t("MetricConfigurationForm.field.includeReason.label")}
      </FormSwitch>
      <FormAutocomplete
        variant="bordered"
        isRequired
        control={control}
        name="chatModelId"
        className="col-start-1 col-span-2"
        label={t("MetricConfigurationForm.field.chatModelId.label")}
        placeholder={t("MetricConfigurationForm.field.chatModelId.placeholder")}
        component={LlmEndpointAutocomplete}
      />
    </>
  );
};
