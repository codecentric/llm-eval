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

const azureOpenAiConfigurationDataShape = {
  endpoint: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  apiKey: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  apiVersion: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  deployment: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  language: z
    .enum(Object.values(Language) as [Language, ...Language[]])
    .nullable(),
} satisfies z.ZodRawShape;

const AzureOpenAiConfigurationForm = ({
  control,
}: ConfigurationFormProps<
  "AZURE_OPENAI",
  typeof azureOpenAiConfigurationDataShape
>) => {
  const t = useTranslations();

  return (
    <>
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="endpoint"
        label={t("EndpointConfigurationForm.field.endpoint.label")}
        className="col-span-2"
      />
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="apiKey"
        label={t("EndpointConfigurationForm.field.apiKey.label")}
        className="col-span-2"
        type="password"
      />
      <div className="grid grid-cols-subgrid col-span-2">
        <FormInput
          variant="bordered"
          isRequired
          control={control}
          name="apiVersion"
          label={t("EndpointConfigurationForm.field.apiVersion.label")}
        />
        <FormInput
          variant="bordered"
          isRequired
          control={control}
          name="deployment"
          label={t("EndpointConfigurationForm.field.deployment.label")}
        />
      </div>
      <OutputLanguageFormSelect control={control} />
    </>
  );
};

export const azureOpenAiPlugin = createLlmEndpointPlugin({
  type: "AZURE_OPENAI",
  configurationDataShape: azureOpenAiConfigurationDataShape,
  configurationForm: AzureOpenAiConfigurationForm,
  getDefaults: () => ({
    endpoint: "",
    apiKey: "",
    apiVersion: "",
    deployment: "",
    language: null,
  }),
  getDetailItems: (detailsData, t) => [
    createListValueItem({
      label: t("LlmEndpointDetails.labels.url"),
      value: detailsData.configuration.endpoint,
      fullWidth: true,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.apiVersion"),
      value: detailsData.configuration.apiVersion,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.deployment"),
      value: detailsData.configuration.deployment,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.language"),
      value: t(
        `EndpointConfigurationForm.field.language.values.${detailsData.configuration.language}`,
      ),
    }),
  ],
});
