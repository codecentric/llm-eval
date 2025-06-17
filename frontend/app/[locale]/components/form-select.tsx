import { Select, SelectProps } from "@heroui/react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

const valueForSelectionMode = <T,>(
  selectionMode: SelectProps["selectionMode"],
  value: T | undefined,
) => (value ? (selectionMode === "multiple" ? value : [value]) : []);

export type FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends object = object,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
} & SelectProps<TItem>;

export const FormSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends object = object,
>({
  control,
  name,
  children,
  ...selectProps
}: FormSelectProps<TFieldValues, TContext, TName, TItem>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => (
        <Select
          isInvalid={
            !selectProps.isDisabled && !field.disabled && fieldState.invalid
          }
          errorMessage={errorMessageBuilder(fieldState.error)}
          defaultSelectedKeys={valueForSelectionMode(
            selectProps.selectionMode,
            formState.defaultValues?.[name],
          )}
          {...selectProps}
          selectedKeys={valueForSelectionMode(
            selectProps.selectionMode,
            field.value,
          )}
          onSelectionChange={(selection) => {
            if (selection instanceof Set) {
              const selectedKeys = Array.from(selection);
              if (selectProps.selectionMode === "multiple") {
                field.onChange(selectedKeys);
              } else {
                field.onChange(selectedKeys[0] ?? null);
              }
            } else {
              console.error("We shouldn't be here.");
            }
          }}
          isDisabled={selectProps.isDisabled || field.disabled}
          onBlur={field.onBlur}
          name={field.name}
        >
          {children}
        </Select>
      )}
    />
  );
};
