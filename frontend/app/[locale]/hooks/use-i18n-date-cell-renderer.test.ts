import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";

import {
  READABLE_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { TableRow } from "@/app/hooks/use-table";

type TestRow = {
  date: Date;
  num: number;
  str: string;
  optionalDate?: Date;
};

describe("useI18nDateCellRenderer", () => {
  const testDate = new Date();

  const dateRow: TableRow<TestRow> = {
    key: "1",
    date: testDate,
    num: 10,
    str: "2025-01-01T13:00:00.000Z",
  };

  beforeEach(() => {
    mockFormatter.dateTime.mockReset();

    mockFormatter.dateTime.mockReturnValue("formattedDate");
  });

  it("should render a date column value without format options", () => {
    const { result } = renderHook(() => useI18nDateCellRenderer<TestRow>());

    const formattedDate = result.current(dateRow, "date");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(
      dateRow.date,
      undefined,
    );
  });

  it("should render a date column value with format options", () => {
    const { result } = renderHook(() =>
      useI18nDateCellRenderer<TestRow>(READABLE_DATE_FORMAT_OPTIONS),
    );

    const formattedDate = result.current(dateRow, "date");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(
      dateRow.date,
      READABLE_DATE_FORMAT_OPTIONS,
    );
  });

  it("should render a number column value without format options", () => {
    const { result } = renderHook(() => useI18nDateCellRenderer<TestRow>());

    const formattedDate = result.current(dateRow, "num");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(dateRow.num, undefined);
  });

  it("should render a number column value with format options", () => {
    const { result } = renderHook(() =>
      useI18nDateCellRenderer<TestRow>(READABLE_DATE_FORMAT_OPTIONS),
    );

    const formattedDate = result.current(dateRow, "num");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(
      dateRow.num,
      READABLE_DATE_FORMAT_OPTIONS,
    );
  });

  it("should render a string date column value without format options", () => {
    const { result } = renderHook(() => useI18nDateCellRenderer<TestRow>());

    const formattedDate = result.current(dateRow, "str");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(
      new Date(dateRow.str),
      undefined,
    );
  });

  it("should render a string date column value with format options", () => {
    const { result } = renderHook(() =>
      useI18nDateCellRenderer<TestRow>(READABLE_DATE_FORMAT_OPTIONS),
    );

    const formattedDate = result.current(dateRow, "str");

    render(formattedDate);

    expect(screen.getByText("formattedDate")).toBeInTheDocument();
    expect(mockFormatter.dateTime).toHaveBeenCalledWith(
      new Date(dateRow.str),
      READABLE_DATE_FORMAT_OPTIONS,
    );
  });

  it("should render nothing if date value is falsy", () => {
    const { result } = renderHook(() =>
      useI18nDateCellRenderer<TestRow>(READABLE_DATE_FORMAT_OPTIONS),
    );

    const formattedDate = result.current(dateRow, "optionalDate");

    expect(formattedDate).toBeNull();
  });
});
