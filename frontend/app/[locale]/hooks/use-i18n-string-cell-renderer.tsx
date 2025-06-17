import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { CellRenderFunction, ColumnKey } from "@/app/hooks/use-table";

type StringColumn<Rows> = {
  [K in keyof Rows]: K extends ColumnKey<Rows>
    ? Rows[K] extends string
      ? K
      : never
    : never;
}[keyof Rows];

export type UseI18nStringCellRendererProps = {
  prefix?: string;
};

export const useI18nStringCellRenderer = <Rows,>(
  props?: UseI18nStringCellRendererProps,
) => {
  const t = useTranslations();

  const { prefix } = props ?? {};

  return useCallback<CellRenderFunction<Rows, StringColumn<Rows>>>(
    (row, column) => {
      const value = row[column] as string;

      return value ? (prefix ? t(`${prefix}.${value}`) : t(value)) : null;
    },
    [t, prefix],
  );
};
