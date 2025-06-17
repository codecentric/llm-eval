import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { ColumnRenderFunction } from "@/app/hooks/use-table";

export const useI18nColumnRenderer = <Row,>(prefix?: string) => {
  const t = useTranslations();

  return useCallback<ColumnRenderFunction<Row>>(
    (column) => column.name ?? t(`${prefix ? `${prefix}.` : ""}${column.key}`),
    [t, prefix],
  );
};
