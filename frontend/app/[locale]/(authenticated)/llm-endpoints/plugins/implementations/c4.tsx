import { useTranslations } from "next-intl";
import { z } from "zod";

import {
  ConfigurationFormProps,
  createLlmEndpointPlugin,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugin-definition";
import { FormInput } from "@/app/[locale]/components/form-input";
import { createListValueItem } from "@/app/[locale]/components/property-list";
import { formErrors } from "@/app/utils/form-errors";
import { preprocessInputNumber } from "@/app/utils/zod";

const c4ConfigurationDataShape = {
  endpoint: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  apiKey: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  configurationId: z.preprocess(
    preprocessInputNumber,
    z
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .min(1, { message: formErrors.min(1) }),
  ),
} satisfies z.ZodRawShape;

const C4ConfigurationForm = ({
  control,
}: ConfigurationFormProps<"C4", typeof c4ConfigurationDataShape>) => {
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
          name="configurationId"
          label={t("EndpointConfigurationForm.field.configurationId.label")}
        />
      </div>
    </>
  );
};

export const c4Plugin = createLlmEndpointPlugin({
  type: "C4",
  configurationDataShape: c4ConfigurationDataShape,
  configurationForm: C4ConfigurationForm,
  getDefaults: () => ({
    endpoint: "",
    apiKey: "",
    configurationId: 0,
  }),
  getDetailItems: (detailsData, t) => [
    createListValueItem({
      label: t("LlmEndpointDetails.labels.url"),
      value: detailsData.configuration.endpoint,
      fullWidth: true,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.configurationId"),
      value: detailsData.configuration.configurationId,
    }),
  ],
});
