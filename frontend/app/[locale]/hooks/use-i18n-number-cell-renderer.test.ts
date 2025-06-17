import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";

import { useI18nNumberCellRenderer } from "@/app/[locale]/hooks/use-i18n-number-cell-renderer";
import { TableRow } from "@/app/hooks/use-table";

type TestRow = {
  num: number;
  bigInt: bigint;
  optionalNum?: number;
  zeroNum: 0;
};

describe("useI18nNumberCellRenderer", () => {
  const testRow: TableRow<TestRow> = {
    key: "1",
    num: 10,
    bigInt: BigInt(100),
    zeroNum: 0,
  };

  beforeEach(() => {
    mockFormatter.number.mockReset();

    mockFormatter.number.mockReturnValue("formattedNumber");
  });

  it("should render a number column value without format options", () => {
    const { result } = renderHook(() => useI18nNumberCellRenderer<TestRow>());

    const formattedNumber = result.current(testRow, "num");

    render(formattedNumber);

    expect(screen.getByText("formattedNumber")).toBeInTheDocument();
    expect(mockFormatter.number).toHaveBeenCalledWith(testRow.num, undefined);
  });

  it("should render a number column value with format options", () => {
    const { result } = renderHook(() =>
      useI18nNumberCellRenderer<TestRow>("my-format"),
    );

    const formattedNumber = result.current(testRow, "num");

    render(formattedNumber);

    expect(screen.getByText("formattedNumber")).toBeInTheDocument();
    expect(mockFormatter.number).toHaveBeenCalledWith(testRow.num, "my-format");
  });

  it("should render a bigint column value without format options", () => {
    const { result } = renderHook(() => useI18nNumberCellRenderer<TestRow>());

    const formattedNumber = result.current(testRow, "bigInt");

    render(formattedNumber);

    expect(screen.getByText("formattedNumber")).toBeInTheDocument();
    expect(mockFormatter.number).toHaveBeenCalledWith(
      testRow.bigInt,
      undefined,
    );
  });

  it("should render a bigint column value with format options", () => {
    const { result } = renderHook(() =>
      useI18nNumberCellRenderer<TestRow>("my-format"),
    );

    const formattedNumber = result.current(testRow, "bigInt");

    render(formattedNumber);

    expect(screen.getByText("formattedNumber")).toBeInTheDocument();
    expect(mockFormatter.number).toHaveBeenCalledWith(
      testRow.bigInt,
      "my-format",
    );
  });

  it("should format 0", () => {
    const { result } = renderHook(() => useI18nNumberCellRenderer<TestRow>());

    const formattedNumber = result.current(testRow, "zeroNum");

    render(formattedNumber);

    expect(screen.getByText("formattedNumber")).toBeInTheDocument();
    expect(mockFormatter.number).toHaveBeenCalledWith(
      testRow.zeroNum,
      undefined,
    );
  });

  it("should render nothing if number value is undefined", () => {
    const { result } = renderHook(() => useI18nNumberCellRenderer<TestRow>());

    const formattedNumber = result.current(testRow, "optionalNum");

    expect(formattedNumber).toBeNull();
  });
});
