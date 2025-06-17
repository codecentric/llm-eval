import { Input, InputProps } from "@heroui/react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
  valueParser?: (value: string) => TFieldValues[TName];
} & InputProps;

export const FormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  children,
  valueParser,
  ...inputProps
}: FormInputProps<TFieldValues, TContext, TName>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          isInvalid={fieldState.invalid}
          errorMessage={errorMessageBuilder(fieldState.error)}
          {...inputProps}
          {...field}
          value={field.value ?? ""}
          onChange={(e) => {
            field.onChange(valueParser ? valueParser(e.target.value) : e);
          }}
          isDisabled={inputProps.isDisabled || field.disabled}
        >
          {children}
        </Input>
      )}
    />
  );
};
