import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAtom } from "jotai";

import { showContextHelpAtom } from "@/app/state/context-help";
import { JotaiTestProvider } from "@/app/test-utils/jotai";

import { ContextHelp } from "./context-help";

describe("ContextHelp", () => {
  it("should render help content", () => {
    render(
      <JotaiTestProvider initialValues={[[showContextHelpAtom, true]]}>
        <ContextHelp>Help content</ContextHelp>
      </JotaiTestProvider>,
    );

    expect(screen.getByText("Help content")).toBeInTheDocument();
  });

  it("should update global state on close click", async () => {
    const user = userEvent.setup();

    render(
      <JotaiTestProvider initialValues={[[showContextHelpAtom, true]]}>
        <ContextHelp>Help content</ContextHelp>
      </JotaiTestProvider>,
    );

    await user.click(screen.getByRole("button"));

    const { result } = renderHook(() => useAtom(showContextHelpAtom));

    expect(result.current[0]).toBe(false);
  });
});
