import "@/app/test-utils/mock-intl";

import { act, renderHook, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";

import { ConfirmDialogProvider } from "@/app/[locale]/components/confirm-dialog-provider";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";

describe("useConfirmDialog", () => {
  it("should show the confirm dialog", () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    );

    const { result } = renderHook(() => useConfirmDialog(), { wrapper });

    act(() =>
      result.current.showConfirmDialog({
        description: "Test description",
        header: "Test header",
      }),
    );

    expect(screen.getByText("Test header")).toBeInTheDocument();
  });
});
