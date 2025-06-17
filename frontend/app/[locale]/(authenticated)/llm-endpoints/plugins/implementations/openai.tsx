import { useTranslations } from "next-intl";
import { z } from "zod";

import { OutputLanguageFormSelect } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-output-language-form-select";
import {
  ConfigurationFormProps,
  createLlmEndpointPlugin,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugin-definition";
import { FormInput } from "@/app/[locale]/components/form-input";
import { createListValueItem } from "@/app/[locale]/components/property-list";
import { Language } from "@/app/client";
import { formErrors } from "@/app/utils/form-errors";

const openAiConfigurationDataShape = {
  baseUrl: z
    .string({ required_error: formErrors.required })
    .nullable()
    .transform((value) => value || null),
  apiKey: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  model: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  temperature: z
    .union([z.string(), z.number()])
    .nullable()
    .refine((value) => (value ? !Number.isNaN(Number(value)) : true), {
      message: formErrors.nan,
    })
    .transform((value) =>
      value === "" || value === null ? null : Number(value),
    ),
  language: z
    .enum(Object.values(Language) as [Language, ...Language[]])
    .nullable(),
} satisfies z.ZodRawShape;

const OpenAiConfigurationForm = ({
  control,
}: ConfigurationFormProps<"OPENAI", typeof openAiConfigurationDataShape>) => {
  const t = useTranslations();

  return (
    <>
      <FormInput
        variant="bordered"
        control={control}
        name="baseUrl"
        label={t("OpenAiConfigurationForm.field.baseUrl.label")}
        className="col-span-2"
      />
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="apiKey"
        label={t("OpenAiConfigurationForm.field.apiKey.label")}
        className="col-span-2"
        type="password"
      />
      <div className="grid grid-cols-subgrid col-span-2">
        <FormInput
          variant="bordered"
          isRequired
          control={control}
          name="model"
          label={t("OpenAiConfigurationForm.field.model.label")}
        />
        <FormInput
          variant="bordered"
          control={control}
          name="temperature"
          label={t("OpenAiConfigurationForm.field.temperature.label")}
        />
      </div>
      <OutputLanguageFormSelect control={control} />
    </>
  );
};

export const openAiPlugin = createLlmEndpointPlugin({
  type: "OPENAI",
  configurationDataShape: openAiConfigurationDataShape,
  configurationForm: OpenAiConfigurationForm,
  getDefaults: () => ({
    baseUrl: null,
    apiKey: "",
    model: "",
    temperature: null,
    language: null,
  }),
  getDetailItems: (detailsData, t) => [
    createListValueItem({
      label: t("LlmEndpointDetails.labels.baseUrl"),
      value: detailsData.configuration.baseUrl,
      fullWidth: true,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.model"),
      value: detailsData.configuration.model,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.temperature"),
      value: detailsData.configuration.temperature,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.language"),
      value: t(
        `EndpointConfigurationForm.field.language.values.${detailsData.configuration.language}`,
      ),
    }),
  ],
});
