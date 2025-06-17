import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";

import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import { TableRow } from "@/app/hooks/use-table";

type TestRow = {
  num: number;
  str: string;
};

describe("useLinkCellRenderer", () => {
  const testRow: TableRow<TestRow> = {
    key: "1",
    num: 10,
    str: "test",
  };

  it("should render link from string column", () => {
    const { result } = renderHook(() =>
      useLinkCellRenderer<TestRow>((row) => `https://link:${row.key}`),
    );

    render(result.current(testRow, "str"), { wrapper: MockIntlWrapper });

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("href", "https://link:1");
    expect(link).toHaveTextContent("test");
  });

  it("should render link from number column", () => {
    const { result } = renderHook(() =>
      useLinkCellRenderer<TestRow>(
        (row) => `https://link:${row.key}`,
        (row) => `NUM_${row.num}`,
      ),
    );

    render(result.current(testRow, "num"), { wrapper: MockIntlWrapper });

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("href", "https://link:1");
    expect(link).toHaveTextContent("NUM_10");
  });

  it("should render nothing if link text is empty", () => {
    const { result } = renderHook(() =>
      useLinkCellRenderer<TestRow>(
        (row) => `https://link:${row.key}`,
        () => "",
      ),
    );

    render(result.current(testRow, "num"), { wrapper: MockIntlWrapper });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should render nothing if link is empty", () => {
    const { result } = renderHook(() =>
      useLinkCellRenderer<TestRow>(
        () => "",
        () => "text",
      ),
    );

    render(result.current(testRow, "num"), { wrapper: MockIntlWrapper });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
