import { AutocompleteProps } from "@heroui/react";
import { ComponentProps, ComponentType } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

type BaseAutocompleteProps = Pick<
  AutocompleteProps,
  | "isInvalid"
  | "errorMessage"
  | "name"
  | "selectedKey"
  | "onSelectionChange"
  | "onBlur"
  | "isDisabled"
  | "disabled"
>;

export type FormAutocompleteProps<
  TComponent extends ComponentType<BaseAutocompleteProps>,
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
  component: TComponent;
} & ComponentProps<TComponent>;

export const FormAutocomplete = <
  TComponent extends ComponentType<BaseAutocompleteProps>,
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  component,
  ...autocompleteProps
}: FormAutocompleteProps<TComponent, TFieldValues, TContext, TName>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  const AutocompleteComponent =
    component as ComponentType<BaseAutocompleteProps>;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <AutocompleteComponent
          isInvalid={fieldState.invalid}
          errorMessage={errorMessageBuilder(fieldState.error)}
          {...autocompleteProps}
          name={field.name}
          selectedKey={field.value}
          onSelectionChange={(key) => {
            field.onChange(key);

            autocompleteProps.onSelectionChange?.(key);
          }}
          onBlur={field.onBlur}
          isDisabled={field.disabled || autocompleteProps.isDisabled}
          disabled={field.disabled}
        />
      )}
    />
  );
};
