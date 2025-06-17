import { Divider, Input } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";

import {
  BaseConfigurationDataShape,
  BaseQACatalogGenerationType,
  ConfigurationFormProps,
} from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/plugin-definition";
import { FormInput } from "@/app/[locale]/components/form-input";
import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

export const BaseQACatalogGenerationConfigurationForm = <
  Type extends BaseQACatalogGenerationType,
>({
  control,
}: ConfigurationFormProps<Type, BaseConfigurationDataShape>) => {
  const t = useTranslations();
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  const c = control as unknown as Control<BaseConfigurationDataShape>;

  return (
    <div className="flex flex-col space-y-3">
      <FormInput
        variant="bordered"
        isRequired
        control={c}
        name="name"
        label={t("QACatalogGeneratorForm.field.name.label")}
        className="col-start-1"
      />

      <Controller
        name="files"
        control={c}
        render={({ field, fieldState }) => (
          <div
            className="flex flex-col space-y-2"
            data-testid="QACatalogGeneratorForm.field.files.container"
          >
            <Input
              isRequired
              label={t("QACatalogGeneratorForm.field.files.label")}
              className="col-start-1"
              type="file"
              multiple={true}
              variant="bordered"
              onChange={(e) => {
                field.onChange(e.target.files);
              }}
              isInvalid={fieldState.invalid}
              errorMessage={errorMessageBuilder(fieldState.error)}
            />
          </div>
        )}
      />
      <Divider className="col-span-2 my-2" />
    </div>
  );
};
