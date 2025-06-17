import { Checkbox, CheckboxGroup, CheckboxProps } from "@heroui/react";
import { cx } from "classix";
import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

const GroupCheckbox: React.FC<CheckboxProps> = (props) => {
  return (
    <Checkbox
      {...props}
      classNames={{
        base: cx(
          "w-full max-w-none m-0",
          "border-2 border-default-200 rounded-medium w-full p-2 hover:border-default-400",
          "data-[selected=true]:border-primary data-[selected=true]:hover:border-primary",
          "data-[invalid=true]:border-danger data-[invalid=true]:hover:border-danger",
          "data-[focus-visible=true]:!border-default-foreground",
        ),
        hiddenInput: "-ml-2",
        wrapper:
          "group-data-[focus-visible=true]:!ring-0 group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent group-data-[focus-visible=true]:ring-offset-0",
      }}
    />
  );
};

export type FormCheckboxGroupItem<TItem> = {
  value: string;
  rawItem: TItem;
};

export type FormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
  className?: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  items: FormCheckboxGroupItem<TItem>[];
  checkboxContent: React.ComponentType<{ item: TItem }>;
  emptyMessage?: React.ReactNode;
};

export const FormCheckboxGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
>({
  control,
  name,
  className,
  isDisabled,
  isRequired,
  label,
  items,
  checkboxContent: CheckboxContent,
  emptyMessage = null,
}: FormCheckboxGroupProps<TFieldValues, TContext, TName, TItem>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={className}>
          <CheckboxGroup
            orientation="horizontal"
            classNames={{
              base: "w-full",
              wrapper: "grid grid-cols-2 gap-x-4 gap-y-2",
              label: "text-default-600",
            }}
            label={label}
            value={field.value}
            onChange={field.onChange}
            isDisabled={isDisabled || field.disabled}
            isRequired={isRequired}
            errorMessage={errorMessageBuilder(fieldState.error)}
            isInvalid={fieldState.invalid}
          >
            {items.map((item) => (
              <GroupCheckbox key={item.value} value={item.value}>
                <CheckboxContent item={item.rawItem} />
              </GroupCheckbox>
            ))}
          </CheckboxGroup>

          {!items.length && (
            <div className="italic text-small">{emptyMessage}</div>
          )}
        </div>
      )}
    />
  );
};
