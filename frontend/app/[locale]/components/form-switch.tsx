import { Switch, SwitchProps } from "@heroui/react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
  valueParser?: (value: boolean) => TFieldValues[TName];
} & SwitchProps;

export const FormSwitch = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  children,
  valueParser,
  ...switchProps
}: FormSwitchProps<TFieldValues, TContext, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Switch
          {...switchProps}
          isSelected={field.value}
          onValueChange={(value) => {
            field.onChange(valueParser ? valueParser(value) : value);
          }}
          color={fieldState.invalid ? "danger" : switchProps.color}
          isDisabled={field.disabled || switchProps.isDisabled}
          onBlur={field.onBlur}
          name={field.name}
        >
          {children}
        </Switch>
      )}
    />
  );
};
