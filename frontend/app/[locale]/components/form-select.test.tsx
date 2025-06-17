import "@/app/test-utils/mock-intl";

import { SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { FormSelect } from "@/app/[locale]/components/form-select";
import { renderForm } from "@/app/test-utils/hook-form";

const testSchema = z.object({
  value: z.string({ required_error: "REQUIRED" }),
});

type FormData = z.infer<typeof testSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testSchemaMulti = z.object({
  value: z.array(z.string({ required_error: "REQUIRED" })),
});

type FormDataMulti = z.infer<typeof testSchemaMulti>;

describe("FormSelect", () => {
  it("displays error message when required field is not filled", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormSelect name="value" control={control} aria-label="select">
          <SelectItem key="option1">Option 1</SelectItem>
        </FormSelect>
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

  it("should update the form data on selection", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>((control) => (
      <FormSelect name="value" control={control} aria-label="select">
        <SelectItem key="option1">Option 1</SelectItem>
        <SelectItem key="option2">Option 2</SelectItem>
      </FormSelect>
    ));

    await user.click(screen.getByRole("button"));
    await user.click(screen.getAllByRole("option")[1]);

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: "option2" } });
  });

  it("should update the form data on multi selection", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormDataMulti>((control) => (
      <FormSelect
        name="value"
        control={control}
        aria-label="select"
        selectionMode="multiple"
      >
        <SelectItem key="option1">Option 1</SelectItem>
        <SelectItem key="option2">Option 2</SelectItem>
        <SelectItem key="option3">Option 3</SelectItem>
      </FormSelect>
    ));

    await user.click(screen.getByRole("button"));
    await user.click(screen.getAllByRole("option")[0]);
    await user.click(screen.getAllByRole("option")[2]);

    const result = await submit();

    expect(result).toEqual({
      type: "success",
      data: { value: ["option1", "option3"] },
    });
  });

  it("disables the select when isDisabled is true", () => {
    renderForm<FormData>((control) => (
      <FormSelect name="value" control={control} aria-label="select" isDisabled>
        <SelectItem key="option1">Option 1</SelectItem>
      </FormSelect>
    ));

    expect(screen.getByRole("button")).toHaveAttribute("data-disabled", "true");
  });
});
