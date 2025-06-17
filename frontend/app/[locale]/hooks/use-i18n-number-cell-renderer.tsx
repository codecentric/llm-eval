import { NumberFormatOptions, useFormatter } from "next-intl";
import { useCallback } from "react";

import { CellRenderFunction, ColumnKey } from "@/app/hooks/use-table";

type NumberValue = number | bigint | undefined;
type NumberColumn<Rows> = {
  [K in keyof Rows]: K extends ColumnKey<Rows>
    ? Rows[K] extends NumberValue
      ? K
      : never
    : never;
}[keyof Rows];

export const useI18nNumberCellRenderer = <Rows,>(
  formatOrOptions?: string | NumberFormatOptions,
) => {
  const formatter = useFormatter();

  return useCallback<CellRenderFunction<Rows, NumberColumn<Rows>>>(
    (row, column) => {
      const value = row[column] as NumberValue;

      return value != undefined
        ? formatter.number(value, formatOrOptions)
        : null;
    },
    [formatter, formatOrOptions],
  );
};
