import { SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";
import { z } from "zod";

import {
  filterSupportedGeneratorTypes,
  supportedCatalogGeneratorTypes,
} from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/helpers";
import { FormSelect } from "@/app/[locale]/components/form-select";
import { ActiveQaCatalogGeneratorType } from "@/app/client";
import { formErrors } from "@/app/utils/form-errors";

export const catalogGeneratorTypeSelectionSchema = z.object({
  generatorType: z.enum(supportedCatalogGeneratorTypes, {
    required_error: formErrors.required,
  }),
});

export type QACatalogGeneratorTypeSelectionProps = {
  generatorTypes: ActiveQaCatalogGeneratorType[];
  control: Control<z.infer<typeof catalogGeneratorTypeSelectionSchema>>;
  isDisabled?: boolean;
};

export const QACatalogGeneratorTypeSelectionForm = ({
  control,
  generatorTypes,
  isDisabled,
}: QACatalogGeneratorTypeSelectionProps) => {
  const t = useTranslations();

  return (
    <FormSelect
      isRequired
      control={control}
      name="generatorType"
      label={t("QACatalogGeneratorTypeSelectionForm.select.label")}
      placeholder={t("QACatalogGeneratorTypeSelectionForm.select.placeholder")}
      variant="bordered"
      isDisabled={isDisabled}
      items={filterSupportedGeneratorTypes(generatorTypes)}
    >
      {(type) => (
        <SelectItem
          key={type.type.toString()}
          textValue={t(`catalogGeneratorType.${type.type}`)}
        >
          <div>{t(`catalogGeneratorType.${type.type}`)}</div>
        </SelectItem>
      )}
    </FormSelect>
  );
};
