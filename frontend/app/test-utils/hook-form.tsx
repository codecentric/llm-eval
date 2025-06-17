import { act, render, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import {
  Control,
  FieldErrors,
  FieldValues,
  useForm,
  UseFormHandleSubmit,
  UseFormProps,
} from "react-hook-form";

export type SubmitResult<TFieldValues extends FieldValues> =
  | { type: "success"; data: TFieldValues }
  | { type: "failure"; errors: FieldErrors<TFieldValues> };

const submitForm =
  <TFieldValues extends FieldValues>(
    handleSubmit: UseFormHandleSubmit<TFieldValues>,
  ) =>
  async () => {
    let result: SubmitResult<TFieldValues> | undefined;

    await act(() =>
      handleSubmit(
        (data) => {
          result = { type: "success", data };
        },
        (errors) => {
          result = { type: "failure", errors };
        },
      )(),
    );

    return result;
  };

export const renderForm = <TFieldValues extends FieldValues>(
  content: (control: Control<TFieldValues>) => ReactNode,
  formProps?: UseFormProps<TFieldValues>,
) => {
  const { result } = renderHook(() => useForm<TFieldValues>(formProps));

  const { control, handleSubmit } = result.current;

  render(<form noValidate>{content(control)}</form>);

  return { submit: submitForm(handleSubmit) };
};
