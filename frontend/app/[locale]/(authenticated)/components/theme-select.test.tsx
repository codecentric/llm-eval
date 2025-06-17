import "@/app/test-utils/mock-intl";

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";

import { selectFromDropDown } from "@/app/test-utils/forms";

import { ThemeSelect } from "./theme-select";

vi.mock("next-themes");

describe("ThemeSelect", () => {
  it("should update theme based on selection", async () => {
    const user = userEvent.setup();

    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme,
      themes: ["light", "dark"],
    });

    render(<ThemeSelect />);

    await selectFromDropDown(
      user,
      "ThemeSelect.ariaLabel",
      "ThemeSelect.option.light",
    );

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
