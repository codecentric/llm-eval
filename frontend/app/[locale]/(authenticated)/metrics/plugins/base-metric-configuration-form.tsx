import { Divider } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";

import {
  BaseConfigurationDataShape,
  BaseMetricType,
  ConfigurationFormProps,
} from "@/app/[locale]/(authenticated)/metrics/plugins/plugin-definition";
import { FormInput } from "@/app/[locale]/components/form-input";
import { FormSwitch } from "@/app/[locale]/components/form-switch";

export const BaseMetricConfigurationForm = <Type extends BaseMetricType>({
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
        label={t("MetricConfigurationForm.field.name.label")}
        className="col-start-1"
      />
      <Divider className="col-span-2 my-2" />
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="threshold"
        label={t("MetricConfigurationForm.field.threshold.label")}
        className="col-start-1"
      />
      <FormSwitch name="strictMode" control={c} className="col-start-1">
        {t("MetricConfigurationForm.field.strictMode.label")}
      </FormSwitch>
    </>
  );
};
