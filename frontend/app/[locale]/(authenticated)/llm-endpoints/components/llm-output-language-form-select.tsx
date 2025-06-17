import { SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormSelect } from "@/app/[locale]/components/form-select";
import { Language } from "@/app/client";

export type OutputLanguageFormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = {
  control: Control<TFieldValues, TContext>;
};

export const OutputLanguageFormSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  control,
}: OutputLanguageFormSelectProps<TFieldValues, TContext>) => {
  const t = useTranslations();
  return (
    <FormSelect
      isRequired={false}
      control={control}
      name={"language" as FieldPath<TFieldValues>}
      label={t("EndpointConfigurationForm.field.language.label")}
      placeholder={t("EndpointConfigurationForm.field.language.placeholder")}
      selectionMode="single"
      variant="bordered"
      items={Object.values(Language).map((l) => ({ name: l }))}
    >
      {(lang) => (
        <SelectItem
          key={lang.name}
          textValue={t(
            `EndpointConfigurationForm.field.language.values.${lang.name}`,
          )}
        >
          <div>
            {t(`EndpointConfigurationForm.field.language.values.${lang.name}`)}
          </div>
        </SelectItem>
      )}
    </FormSelect>
  );
};
