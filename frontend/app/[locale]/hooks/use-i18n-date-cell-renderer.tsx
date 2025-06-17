import { DateTimeFormatOptions, useFormatter } from "next-intl";
import { useCallback } from "react";

import { CellRenderFunction, ColumnKey } from "@/app/hooks/use-table";

type DateValue = Date | number | string | undefined;
type DateColumn<Rows> = {
  [K in keyof Rows]: K extends ColumnKey<Rows>
    ? Rows[K] extends DateValue
      ? K
      : never
    : never;
}[keyof Rows];

export const FULL_NUMERIC_DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
} satisfies DateTimeFormatOptions;

export const READABLE_DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
} satisfies DateTimeFormatOptions;

export const useI18nDateCellRenderer = <Rows,>(
  formatOrOptions?: string | DateTimeFormatOptions,
) => {
  const formatter = useFormatter();

  return useCallback<CellRenderFunction<Rows, DateColumn<Rows>>>(
    (row, column) => {
      let value = row[column] as DateValue;
      if (typeof value === "string") {
        value = new Date(value);
      }

      return value ? formatter.dateTime(value, formatOrOptions) : null;
    },
    [formatter, formatOrOptions],
  );
};
