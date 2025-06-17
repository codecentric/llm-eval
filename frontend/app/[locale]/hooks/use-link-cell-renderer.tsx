import { Link } from "@heroui/react";
import { useCallback } from "react";

import { CellRenderFunction, ColumnKey, TableRow } from "@/app/hooks/use-table";
import { Link as NavLink } from "@/i18n/routing";

type StringColumn<Rows> = {
  [K in keyof Rows]: K extends ColumnKey<Rows>
    ? Rows[K] extends string
      ? K
      : never
    : never;
}[keyof Rows];

export function useLinkCellRenderer<Rows>(
  href: (row: TableRow<Rows>) => string | undefined,
): CellRenderFunction<Rows, StringColumn<Rows>>;

export function useLinkCellRenderer<
  Rows,
  Column extends ColumnKey<Rows> = ColumnKey<Rows>,
>(
  href: (row: TableRow<Rows>) => string | undefined,
  text: (row: TableRow<Rows>) => string | undefined,
): CellRenderFunction<Rows, Column>;

export function useLinkCellRenderer<Rows>(
  href: (row: TableRow<Rows>) => string | undefined,
  text?: (row: TableRow<Rows>) => string | undefined,
): CellRenderFunction<Rows, ColumnKey<Rows>> {
  return useCallback<CellRenderFunction<Rows, ColumnKey<Rows>>>(
    (row, column) => {
      const linkText = text
        ? text(row)
        : (row[column as StringColumn<Rows>] as string);
      const linkHref = href(row);
      if (!linkText?.length || !linkHref?.length) {
        return null;
      }
      return (
        <Link as={NavLink} href={linkHref} className="text-[length:inherit]">
          {linkText}
        </Link>
      );
    },
    [href, text],
  );
}
