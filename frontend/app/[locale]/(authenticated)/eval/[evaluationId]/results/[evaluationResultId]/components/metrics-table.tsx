"use client";

import { Table, TableBody, TableHeader } from "@heroui/react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";

import { MetricSuccessIcon } from "@/app/[locale]/(authenticated)/eval/components/metric-success-icon";
import { MetricValue } from "@/app/[locale]/(authenticated)/eval/components/metric-value";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import { MetricsData } from "@/app/client";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";

export type MetricsTableProps = { metrics: MetricsData[]; className?: string };

export const MetricsTable = ({ metrics, className }: MetricsTableProps) => {
  const t = useTranslations();
  const formatter = useFormatter();

  const columnRenderer = useI18nColumnRenderer<MetricsData>(
    "MetricsTable.column",
  );

  const successRenderer = useCallback<
    CellRenderFunction<MetricsData, "success">
  >((row, column) => {
    return (
      <div className="flex flex-col items-center">
        <MetricSuccessIcon success={row[column]} />
      </div>
    );
  }, []);

  const scoreRenderer = useCallback<CellRenderFunction<MetricsData, "score">>(
    (row, column) =>
      row[column] != null ? <MetricValue value={row[column]} /> : null,
    [],
  );

  const numberRenderer = useCallback<
    CellRenderFunction<MetricsData, "score" | "threshold">
  >(
    (row, column) =>
      row[column] != null ? formatter.number(row[column]) : null,
    [formatter],
  );

  const { renderTableColumns, renderTableRows } = useTable({
    rows: metrics,
    columns: [
      "name",
      { key: "success", textAlign: "center" },
      { key: "score", textAlign: "right" },
      { key: "threshold", textAlign: "right" },
      "reason",
      "evaluationModel",
      "strictMode",
      "error",
    ],
    key: "id",
    cellRenderer: {
      success: successRenderer,
      threshold: numberRenderer,
      score: scoreRenderer,
    },
    columnRenderer,
  });

  return (
    <Table aria-label={t("MetricsTable.ariaLabel")} className={className}>
      <TableHeader>{renderTableColumns()}</TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
