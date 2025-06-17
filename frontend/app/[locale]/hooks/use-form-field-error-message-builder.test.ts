import "@/app/test-utils/mock-intl";
import { renderHook } from "@testing-library/react";
import { FieldError } from "react-hook-form";

import { useFormFieldErrorMessageBuilder } from "./use-form-field-error-message-builder";

type TestCase = {
  error?: FieldError | FieldError[];
  position?: number;
  expectedMessage?: string;
};

const fieldError = (message: string): FieldError => ({
  message,
  type: "error",
});

describe("useFormFieldErrorMessageBuilder", () => {
  it.each<TestCase>([
    {
      error: fieldError("test"),
      expectedMessage: "test",
    },
    {
      error: [fieldError("test1"), fieldError("test2")],
      position: 1,
      expectedMessage: "test2",
    },
    {},
    { error: [fieldError("test1"), fieldError("test2")] },
    { error: fieldError("") },
    {
      error: fieldError('test|{"min":123}'),
      expectedMessage: 'test - {"min":123}',
    },
  ])(
    "should return translated error message '$expectedMessage' from errors '$error'",
    ({ error, position, expectedMessage }) => {
      const { result } = renderHook(() => useFormFieldErrorMessageBuilder());

      expect(result.current(error, position)).toEqual(expectedMessage);
    },
  );
});
