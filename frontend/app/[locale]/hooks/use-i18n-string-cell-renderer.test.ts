import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";

import { useI18nStringCellRenderer } from "@/app/[locale]/hooks/use-i18n-string-cell-renderer";
import { TableRow } from "@/app/hooks/use-table";

type TestRow = {
  value: string;
  emptyString: "";
};

describe("useI18nStringCellRenderer", () => {
  const testRow: TableRow<TestRow> = {
    key: "1",
    value: "test",
    emptyString: "",
  };

  it("should render a translated string without prefix", () => {
    const { result } = renderHook(() => useI18nStringCellRenderer<TestRow>());

    const formattedString = result.current(testRow, "value");

    render(formattedString);

    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("should render a translated string with prefix", () => {
    const { result } = renderHook(() =>
      useI18nStringCellRenderer<TestRow>({ prefix: "prefix" }),
    );

    const formattedString = result.current(testRow, "value");

    render(formattedString);

    expect(screen.getByText("prefix.test")).toBeInTheDocument();
  });

  it("should render nothing if string is empty", () => {
    const { result } = renderHook(() => useI18nStringCellRenderer<TestRow>());

    const formattedString = result.current(testRow, "emptyString");

    expect(formattedString).toBeNull();
  });
});
