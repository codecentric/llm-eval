import { Button, Textarea, Tooltip } from "@heroui/react";
import { cx } from "classix";
import { useCallback } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { MdAdd, MdRemove } from "react-icons/md";

import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";

export type FormStringArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues, TContext>;
  name: TName;
  className?: string;
  label?: string;
  isRequired?: boolean;
  addButtonTooltip?: string;
  removeButtonTooltip?: string;
  newValueDefault?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
};

export const FormStringArray = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  className,
  label,
  isRequired,
  newValueDefault,
  addButtonTooltip,
  removeButtonTooltip,
  isDisabled,
  isReadOnly,
}: FormStringArrayProps<TFieldValues, TContext, TName>) => {
  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  const addValue = useCallback(
    (textArray: string[] | null | undefined, value: string) => [
      ...(textArray ?? []),
      value,
    ],
    [],
  );

  const updateValue = useCallback(
    (textArray: string[] | null | undefined, index: number, value: string) =>
      (textArray ?? []).map((v, i) => (i === index ? value : v)),
    [],
  );

  const removeValue = useCallback(
    (textArray: string[] | null | undefined, index: number) =>
      (textArray ?? []).filter((_, i) => i !== index),
    [],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const disabled = isDisabled || field.disabled;

        return (
          <div className={cx(className, disabled && "opacity-disabled")}>
            <div
              className={cx(
                !disabled && !fieldState.invalid && "hover:border-default-400",
                fieldState.invalid
                  ? "border-danger hover:border-danger"
                  : "border-default-200",
                "border-medium rounded-medium border-solid py-2 px-3",
              )}
            >
              {!isReadOnly && (
                <div className="flex justify-between">
                  <div
                    className={cx(
                      fieldState.invalid ? "text-danger" : "text-default-600",
                      "text-small scale-85 origin-top-left",
                      isRequired &&
                        "after:content-['*'] after:text-danger after:ml-0.5 rtl:after:ml-[unset] rtl:after:mr-0.5",
                    )}
                  >
                    {label}
                  </div>
                  <Tooltip content={addButtonTooltip}>
                    <Button
                      isIconOnly
                      variant="light"
                      radius="full"
                      size="sm"
                      color={fieldState.invalid ? "danger" : "default"}
                      onPress={() => {
                        field.onChange(
                          addValue(field.value, newValueDefault ?? ""),
                        );
                        field.onBlur();
                      }}
                      isDisabled={disabled}
                      data-testid="add-button"
                    >
                      <MdAdd />
                    </Button>
                  </Tooltip>
                </div>
              )}

              <div
                className={cx("flex flex-col gap-2 mr-8", isReadOnly && "mr-0")}
              >
                {(field.value ?? []).map((value, index) => {
                  const errorMessage = errorMessageBuilder(
                    fieldState.error,
                    index,
                  );

                  return (
                    <div key={index}>
                      <Textarea
                        value={value}
                        onValueChange={(text) =>
                          field.onChange(updateValue(field.value, index, text))
                        }
                        endContent={
                          !isReadOnly && (
                            <Tooltip content={removeButtonTooltip}>
                              <Button
                                isIconOnly
                                variant="light"
                                radius="full"
                                size="sm"
                                onPress={() => {
                                  field.onChange(
                                    removeValue(field.value, index),
                                  );
                                  field.onBlur();
                                }}
                                color={errorMessage ? "danger" : "default"}
                                isDisabled={disabled}
                                data-testid="remove-button"
                              >
                                <MdRemove />
                              </Button>
                            </Tooltip>
                          )
                        }
                        onBlur={field.onBlur}
                        errorMessage={errorMessage}
                        isInvalid={!!errorMessage}
                        isDisabled={disabled}
                        role="textbox"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {fieldState.error && !Array.isArray(fieldState.error) && (
              <div className="text-tiny text-danger p-1">
                {errorMessageBuilder(fieldState.error)}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
