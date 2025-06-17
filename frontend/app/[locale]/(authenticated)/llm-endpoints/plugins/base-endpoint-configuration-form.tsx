import { Divider } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";

import {
  BaseConfigurationDataShape,
  BaseEndpointType,
  ConfigurationFormProps,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugin-definition";
import { FormInput } from "@/app/[locale]/components/form-input";

export const BaseEndpointConfigurationForm = <Type extends BaseEndpointType>({
  control,
}: ConfigurationFormProps<Type, BaseConfigurationDataShape>) => {
  const t = useTranslations();

  const c = control as unknown as Control<BaseConfigurationDataShape>;

  return (
    <>
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="name"
        label={t("EndpointConfigurationForm.field.name.label")}
        className="col-start-1"
      />
      <Divider className="col-span-2 my-2" />
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="parallelQueries"
        label={t("EndpointConfigurationForm.field.parallelQueries.label")}
      />
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="maxRetries"
        label={t("EndpointConfigurationForm.field.maxRetries.label")}
      />
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="requestTimeout"
        label={t("EndpointConfigurationForm.field.requestTimeout.label")}
        description={t(
          "EndpointConfigurationForm.field.requestTimeout.description",
        )}
      />
      <Divider className="col-start-1 col-span-2 my-2" />
    </>
  );
};
