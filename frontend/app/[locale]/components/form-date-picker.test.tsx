import "@/app/test-utils/mock-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, now, parseAbsolute } from "@internationalized/date";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { renderForm } from "@/app/test-utils/hook-form";
import { zonedDateTime } from "@/app/utils/zod";

import { FormDatePicker } from "./form-date-picker";

const testSchema = z.object({
  value: zonedDateTime({ message: "ERROR" }),
});

type FormData = z.infer<typeof testSchema>;

describe("FormDatePicker", () => {
  it("should emit on change event if date is entered", async () => {
    const user = userEvent.setup();

    const dateTime = parseAbsolute("2025-10-01T10:12:45Z", "UTC");

    const { submit } = renderForm<FormData>(
      (control) => (
        <FormDatePicker
          control={control}
          name="value"
          hideTimeZone
          showMonthAndYearPickers
          placeholderValue={dateTime}
          granularity="second"
          label="Picker"
        />
      ),
      { resolver: zodResolver(testSchema) },
    );

    await user.click(screen.getByRole("spinbutton", { name: "month, Picker" }));
    await user.keyboard("10012025101245");

    const result = await submit();

    expect(result).toEqual({
      type: "success",
      data: {
        value: dateTime,
      },
    });
  });

  it("should be disabled if isDisabled is set to true", () => {
    renderForm<FormData>((control) => (
      <FormDatePicker
        control={control}
        name="value"
        hideTimeZone
        showMonthAndYearPickers
        placeholderValue={now(getLocalTimeZone())}
        granularity="second"
        isDisabled={true}
        label="Picker"
      />
    ));

    const datePicker = screen.getByRole("group", { name: "Picker" });

    expect(datePicker).toHaveAttribute("aria-disabled", "true");
  });

  it("should show an error message when field is invalid", async () => {
    const { submit } = renderForm<FormData>(
      (control) => (
        <FormDatePicker
          control={control}
          name="value"
          hideTimeZone
          showMonthAndYearPickers
          placeholderValue={now(getLocalTimeZone())}
          granularity="second"
          label="Picker"
        />
      ),
      { resolver: zodResolver(testSchema) },
    );

    const result = await submit();

    expect(result).toEqual({
      type: "failure",
      errors: {
        value: expect.objectContaining({ message: "ERROR" }),
      },
    });
  });
});
