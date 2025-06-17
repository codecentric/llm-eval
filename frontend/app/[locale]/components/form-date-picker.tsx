import { DatePicker, DatePickerProps } from "@heroui/react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

export type FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
} & DatePickerProps;

export const FormDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  ...datePickerProps
}: FormDatePickerProps<TFieldValues, TContext, TName>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          isInvalid={fieldState.invalid}
          errorMessage={errorMessageBuilder(fieldState.error)}
          {...datePickerProps}
          {...field}
          value={field.value}
          onChange={(value) => {
            field.onChange(value);
          }}
          isDisabled={datePickerProps.isDisabled || field.disabled}
        />
      )}
    />
  );
};
