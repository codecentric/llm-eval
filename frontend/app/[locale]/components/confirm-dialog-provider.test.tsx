import "@/app/test-utils/mock-intl";

import { act, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropsWithChildren } from "react";

import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";

import { ConfirmDialogProvider } from "./confirm-dialog-provider";

const IntlWrapper = MockIntlWrapper;

describe("ConfirmDialogProvider", () => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <IntlWrapper>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    </IntlWrapper>
  );

  it("should open the confirm dialog when showConfirmDialog is called", () => {
    const { result } = renderHook(() => useConfirmDialog(), {
      wrapper,
    });

    const showConfirmDialog = result.current.showConfirmDialog;

    act(() =>
      showConfirmDialog({
        header: "Confirm",
        description: "Are you sure?",
        onCancel: () => {},
        onOk: () => {},
      }),
    );

    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("should call onCancel when the Cancel button is clicked", async () => {
    const user = userEvent.setup();

    const onCancel = vi.fn();

    const { result } = renderHook(() => useConfirmDialog(), {
      wrapper,
    });

    const showConfirmDialog = result.current.showConfirmDialog;

    act(() =>
      showConfirmDialog({
        header: "Confirm",
        description: "Are you sure?",
        onCancel,
        onOk: () => {},
        cancelButtonLabel: "Cancel",
      }),
    );

    await user.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onOk when the OK button is clicked", async () => {
    const user = userEvent.setup();

    const onOk = vi.fn();

    const { result } = renderHook(() => useConfirmDialog(), {
      wrapper,
    });

    const showConfirmDialog = result.current.showConfirmDialog;

    act(() =>
      showConfirmDialog({
        header: "Confirm",
        description: "Are you sure?",
        onCancel: () => {},
        onOk,
        okButtonLabel: "ConfirmButton",
      }),
    );

    await user.click(screen.getByText("ConfirmButton"));

    expect(onOk).toHaveBeenCalledTimes(1);
  });
});
