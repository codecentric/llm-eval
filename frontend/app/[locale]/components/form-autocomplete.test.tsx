import "@/app/test-utils/mock-intl";

import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteProps,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { FormAutocomplete } from "@/app/[locale]/components/form-autocomplete";
import { renderForm } from "@/app/test-utils/hook-form";

const testSchema = z.object({
  value: z.string({ required_error: "REQUIRED" }),
});

type FormData = z.infer<typeof testSchema>;

const items = [
  { label: "one", key: "1", description: "one" },
  { label: "two", key: "2", description: "two" },
  { label: "three", key: "3", description: "three" },
];

const TestAutoComplete = (
  props: Omit<
    AutocompleteProps<(typeof items)[number]>,
    "children" | "inputValue" | "isLoading" | "items" | "onInputChange"
  >,
) => {
  return (
    <Autocomplete {...props} items={items} aria-label="autocomplete">
      {(item) => (
        <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};

describe("FormAutoComplete", () => {
  it("should update form data on select", async () => {
    const user = userEvent.setup();

    const { submit } = renderForm<FormData>(
      (control) => (
        <FormAutocomplete
          control={control}
          name="value"
          component={TestAutoComplete}
        />
      ),
      { resolver: zodResolver(testSchema), defaultValues: { value: "3" } },
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "tw" },
    });

    await user.click(screen.getAllByRole("button")[0]);
    await user.click(screen.getByText("two"));

    const result = await submit();

    expect(result).toEqual({ type: "success", data: { value: "2" } });
  });

  it("should show validation error", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormAutocomplete
          control={control}
          name="value"
          component={TestAutoComplete}
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
});
