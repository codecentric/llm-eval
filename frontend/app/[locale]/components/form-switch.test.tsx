import { zodResolver } from "@hookform/resolvers/zod";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { renderForm } from "@/app/test-utils/hook-form";

import { FormSwitch } from "./form-switch";

const testSchema = z.object({
  value: z.boolean({ required_error: "REQUIRED" }),
});

type FormData = z.infer<typeof testSchema>;

describe("FormSwitch", () => {
  it("should display error message when required value is not set", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormSwitch name="value" control={control} aria-label="switch" />
      ),
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

  it("should update the form data on toggle", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>(
      (control) => (
        <FormSwitch name="value" control={control} aria-label="switch" />
      ),
      { resolver: zodResolver(testSchema), defaultValues: { value: false } },
    );

    const switchElement = screen.getByRole("switch");
    await user.click(switchElement);

    const result = await submit();

    expect(result).toEqual({
      type: "success",
      data: {
        value: true,
      },
    });
  });

  it("should be disabled when isDisabled prop is set", () => {
    renderForm<FormData>((control) => (
      <FormSwitch
        name="value"
        control={control}
        aria-label="switch"
        isDisabled
      />
    ));

    const switchElement = screen.getByRole("switch");

    expect(switchElement).toBeDisabled();
  });
});
