import "@/app/test-utils/mock-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { FormStringArray } from "@/app/[locale]/components/form-string-array";
import { renderForm } from "@/app/test-utils/hook-form";

const testSchema = z.object({
  value: z.array(
    z.string({ required_error: "REQUIRED" }).min(1, { message: "SHORT" }),
  ),
});

type FormData = z.infer<typeof testSchema>;

describe("FormStringArray", () => {
  it("should add item", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>((control) => (
      <FormStringArray control={control} name="value" />
    ));

    await user.click(screen.getByTestId("add-button"));

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: [""] } });
  });

  it("should add item with default value", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>((control) => (
      <FormStringArray control={control} name="value" newValueDefault="BLAH" />
    ));

    await user.click(screen.getByTestId("add-button"));

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: ["BLAH"] } });
  });

  it("should remove an item", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>(
      (control) => <FormStringArray control={control} name="value" />,
      { defaultValues: { value: ["ITEM1", "ITEM2"] } },
    );

    await user.click(screen.getAllByTestId("remove-button")[1]);

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: ["ITEM1"] } });
  });

  it("should update an item", async () => {
    const { submit } = renderForm<FormData>(
      (control) => <FormStringArray control={control} name="value" />,
      { defaultValues: { value: ["ITEM1", "ITEM2"] } },
    );

    fireEvent.change(screen.getAllByRole("textbox")[1], {
      target: { value: "UPDATED_ITEM" },
    });

    const result = await submit();

    expect(result).toEqual({
      type: "success",
      data: { value: ["ITEM1", "UPDATED_ITEM"] },
    });
  });

  it("should show validation errors", async () => {
    const { submit } = renderForm<FormData>(
      (control) => <FormStringArray control={control} name="value" />,
      {
        resolver: zodResolver(testSchema),
        defaultValues: { value: [""] },
      },
    );

    const result = await submit();

    expect(result).toEqual({
      type: "failure",
      errors: {
        value: [expect.objectContaining({ message: "SHORT" })],
      },
    });
  });
});
