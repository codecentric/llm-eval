import { SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";
import { z } from "zod";

import {
  filterSupportedMetricTypes,
  supportedMetricTypes,
} from "@/app/[locale]/(authenticated)/metrics/plugins";
import { FormSelect } from "@/app/[locale]/components/form-select";
import { formErrors } from "@/app/utils/form-errors";

export const metricTypeSelectionSchema = z.object({
  metricType: z.enum(supportedMetricTypes, {
    required_error: formErrors.required,
    invalid_type_error: formErrors.required,
  }),
});

export type MetricTypeSelectionFormProps = {
  metricTypes: string[];
  control: Control<z.infer<typeof metricTypeSelectionSchema>>;
  isDisabled?: boolean;
};

export const MetricTypeSelectionForm = ({
  control,
  metricTypes,
  isDisabled,
}: MetricTypeSelectionFormProps) => {
  const t = useTranslations();

  return (
    <FormSelect
      isRequired
      control={control}
      name="metricType"
      label={t("MetricTypeSelectionForm.select.label")}
      placeholder={t("MetricTypeSelectionForm.select.placeholder")}
      variant="bordered"
      isDisabled={isDisabled}
    >
      {filterSupportedMetricTypes(metricTypes).map((type) => (
        <SelectItem key={type}>{t(`metricType.${type}`)}</SelectItem>
      ))}
    </FormSelect>
  );
};
