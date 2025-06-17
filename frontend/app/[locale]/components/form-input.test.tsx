import "@/app/test-utils/mock-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { fireEvent, screen } from "@testing-library/react";
import { z } from "zod";

import { FormInput } from "@/app/[locale]/components/form-input";
import { renderForm } from "@/app/test-utils/hook-form";

const testSchema = z.object({
  value: z.string({ required_error: "REQUIRED" }),
});

type FormData = z.infer<typeof testSchema>;

describe("FormInput", () => {
  it("should emit on change event if text is entered", async () => {
    const { submit } = renderForm<FormData>((control) => (
      <FormInput control={control} name="value" />
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test" } });

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: "test" } });
  });

  it("should be disabled if isDisabled is set to true", () => {
    renderForm<FormData>((control) => (
      <FormInput control={control} name="value" isDisabled={true} />
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;

    expect(input).toBeDisabled();
  });

  it("should parse value before change event if value parser is set", async () => {
    const valueParser = (value: string) => value.toUpperCase();

    const { submit } = renderForm<FormData>((control) => (
      <FormInput control={control} name="value" valueParser={valueParser} />
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test" } });

    expect(input).toHaveValue("TEST");

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: "TEST" } });
  });

  it("should show an error message when field is invalid", async () => {
    const { submit } = renderForm<FormData>(
      (control) => <FormInput control={control} name="value" />,
      { resolver: zodResolver(testSchema) },
    );

    const result = await submit();

    expect(result).toEqual({
      type: "failure",
      errors: {
        value: expect.objectContaining({ message: "REQUIRED" }),
      },
    });
  });
});
