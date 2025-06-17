import { Chip, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { LlmEndpointAutocomplete } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-autocomplete";
import {
  configurationDataWithChatModelShape,
  ConfigurationFormProps,
  createMetricPlugin,
} from "@/app/[locale]/(authenticated)/metrics/plugins/plugin-definition";
import { endpointValueItem } from "@/app/[locale]/(authenticated)/metrics/plugins/shared-details";
import { FormAutocomplete } from "@/app/[locale]/components/form-autocomplete";
import { FormSelect } from "@/app/[locale]/components/form-select";
import { FormStringArray } from "@/app/[locale]/components/form-string-array";
import { createListValueItem } from "@/app/[locale]/components/property-list";
import { LlmTestCaseParams } from "@/app/client";
import { formErrors } from "@/app/utils/form-errors";

const gEvalConfigurationShape = {
  ...configurationDataWithChatModelShape,
  evaluationSteps: z
    .array(
      z
        .string({ required_error: formErrors.required })
        .min(1, { message: formErrors.required }),
      {
        required_error: formErrors.required,
      },
    )
    .min(1, { message: formErrors.arrayMin(1) }),
  evaluationParams: z
    .array(
      z.enum(
        [
          LlmTestCaseParams.ACTUAL_OUTPUT,
          LlmTestCaseParams.EXPECTED_OUTPUT,
          LlmTestCaseParams.EXPECTED_TOOLS,
          LlmTestCaseParams.TOOLS_CALLED,
          LlmTestCaseParams.INPUT,
          LlmTestCaseParams.CONTEXT,
          LlmTestCaseParams.RETRIEVAL_CONTEXT,
        ],
        { required_error: formErrors.required },
      ),
      {
        required_error: formErrors.required,
      },
    )
    .min(1, { message: formErrors.arrayMin(1) }),
} satisfies z.ZodRawShape;

const GEvalConfigurationForm = ({
  control,
}: ConfigurationFormProps<"G_EVAL", typeof gEvalConfigurationShape>) => {
  const t = useTranslations();

  return (
    <>
      <FormStringArray
        isRequired
        control={control}
        name="evaluationSteps"
        className="col-span-2"
        label={t("MetricConfigurationForm.field.evaluationSteps.label")}
        addButtonTooltip={t(
          "MetricConfigurationForm.field.evaluationSteps.addButton",
        )}
        removeButtonTooltip={t(
          "MetricConfigurationForm.field.evaluationSteps.removeButton",
        )}
      />
      <FormSelect
        items={gEvalConfigurationShape.evaluationParams.element.options.map(
          (param) => ({ key: param }),
        )}
        isRequired
        control={control}
        name="evaluationParams"
        className="col-span-2"
        classNames={{
          innerWrapper: "h-auto",
        }}
        label={t("MetricConfigurationForm.field.evaluationParams.label")}
        placeholder={t(
          "MetricConfigurationForm.field.evaluationParams.placeholder",
        )}
        variant="bordered"
        selectionMode="multiple"
        isMultiline
        renderValue={(items) => {
          return (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Chip key={item.key} size="sm" radius="sm">
                  {item.textValue}
                </Chip>
              ))}
            </div>
          );
        }}
      >
        {(item) => (
          <SelectItem key={item.key}>
            {t(`evaluationParam.${item.key}`)}
          </SelectItem>
        )}
      </FormSelect>
      <FormAutocomplete
        variant="bordered"
        isRequired
        control={control}
        name="chatModelId"
        className="col-span-2"
        label={t("MetricConfigurationForm.field.chatModelId.label")}
        placeholder={t("MetricConfigurationForm.field.chatModelId.placeholder")}
        component={LlmEndpointAutocomplete}
      />
    </>
  );
};

export const gEvalMetric = createMetricPlugin({
  type: "G_EVAL",
  configurationDataShape: gEvalConfigurationShape,
  getDefaults: () => ({
    evaluationSteps: [
      "Check whether the facts in 'actual output' contradicts any facts in 'expected output'",
      "You should also heavily penalize omission of detail",
      "Vague language, or contradicting OPINIONS, are OK",
    ],
    evaluationParams: [
      ...([
        LlmTestCaseParams.INPUT,
        LlmTestCaseParams.ACTUAL_OUTPUT,
        LlmTestCaseParams.EXPECTED_OUTPUT,
        LlmTestCaseParams.CONTEXT,
        LlmTestCaseParams.RETRIEVAL_CONTEXT,
      ] as const),
    ],
    chatModelId: null,
    strictMode: false,
    threshold: 0.5,
  }),
  configurationForm: GEvalConfigurationForm,
  getDetailItems: (metric, t) => [
    createListValueItem({
      label: t("MetricDetails.labels.evaluationSteps"),
      value: metric.configuration.evaluationSteps,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.evaluationParams"),
      value: metric.configuration.evaluationParams,
      renderArrayValue: (value) => t(`evaluationParam.${value}`),
    }),
    endpointValueItem(metric.configuration.chatModelId, t),
  ],
});
