import "@/app/test-utils/mock-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { renderForm } from "@/app/test-utils/hook-form";

import { FormCheckboxGroup } from "./form-checkbox-group";

const testSchema = z.object({
  value: z
    .array(z.string(), {
      required_error: "REQUIRED",
    })
    .min(1, { message: "MIN_ITEMS" }),
});

type FormData = z.infer<typeof testSchema>;

const CheckboxContent: React.FC<{ item: string }> = ({ item }) => (
  <div>{item}</div>
);

describe("FormCheckboxGroup", () => {
  const items = [
    { value: "1", rawItem: "item1" },
    { value: "2", rawItem: "item2" },
    { value: "3", rawItem: "item3" },
  ];

  it("should select an item", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>(
      (control) => (
        <FormCheckboxGroup
          control={control}
          name="value"
          items={items}
          checkboxContent={CheckboxContent}
        />
      ),
      { resolver: zodResolver(testSchema), defaultValues: { value: [] } },
    );

    await user.click(screen.getByText("item2"));

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: ["2"] } });
  });

  it("should select multiple items", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>(
      (control) => (
        <FormCheckboxGroup
          control={control}
          name="value"
          items={items}
          checkboxContent={CheckboxContent}
        />
      ),
      { resolver: zodResolver(testSchema), defaultValues: { value: [] } },
    );

    await user.click(screen.getByText("item1"));
    await user.click(screen.getByText("item3"));

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: ["1", "3"] } });
  });

  it("should show validation error if no item is selected", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormCheckboxGroup
          control={control}
          name="value"
          items={items}
          checkboxContent={CheckboxContent}
        />
      ),
      { resolver: zodResolver(testSchema), defaultValues: { value: [] } },
    );

    const result = await submit();

    expect(result).toEqual({
      type: "failure",
      errors: {
        value: expect.objectContaining({ message: "MIN_ITEMS" }),
      },
    });
  });

  it("should show validation error if no item is undefined", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormCheckboxGroup
          control={control}
          name="value"
          items={items}
          checkboxContent={CheckboxContent}
        />
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

  it("disables the checkboxes when isDisabled is true", () => {
    renderForm<FormData>(
      (control) => (
        <FormCheckboxGroup
          control={control}
          name="value"
          items={items}
          checkboxContent={CheckboxContent}
          isDisabled
        />
      ),
      { resolver: zodResolver(testSchema) },
    );

    const checkboxes = screen.getAllByRole("checkbox");

    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });
});
