"use client";

import { addToast, Table, TableBody, TableHeader } from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { MdDelete, MdEdit, MdRemoveRedEye } from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { metricEditPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/edit/page-info";
import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { useMetricDelete } from "@/app/[locale]/(authenticated)/metrics/hooks/use-metric-delete";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import { Metric, MetricsGetAllResponse } from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";
import { EditOrigin } from "@/app/types/edit-origin";

type EvaluationMetricsTableProps = {
  items: MetricsGetAllResponse;
  hasMore: boolean;
  loadMore: () => Promise<unknown>;
};

export const EvaluationMetricsTable = (props: EvaluationMetricsTableProps) => {
  const t = useTranslations();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const { delete: deleteMetric } = useMetricDelete({
    onSuccess: ({ message }) => {
      addToast({ title: message, color: "success" });
    },
  });

  const columnRenderer = useI18nColumnRenderer<Metric>(
    "EvaluationMetricsTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<Metric>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const typeRenderer = useCallback<CellRenderFunction<Metric, string>>(
    (row) => {
      return (
        <div className="flex flex-wrap min-w-24">
          {t(`metricType.${row.configuration.type}`)}
        </div>
      );
    },
    [t],
  );

  const actionsCellRenderer = useCallback<CellRenderFunction<Metric, string>>(
    (row) => {
      return (
        <TableRowActions
          actions={[
            {
              icon: MdRemoveRedEye,
              href: metricDetailsPage(row.id, row.configuration.name).href,
              tooltip: t("EvaluationMetricsTable.actions.view"),
            },
            {
              icon: MdEdit,
              href: metricEditPage({
                metricId: row.id,
                name: row.configuration.name,
                origin: EditOrigin.LIST,
              }).href,
              tooltip: t("EvaluationMetricsTable.actions.edit"),
            },
            {
              icon: MdDelete,
              onPress: () => deleteMetric(row),
              tooltip: t("EvaluationMetricsTable.actions.delete"),
              color: "danger",
            },
          ]}
        />
      );
    },
    [t, deleteMetric],
  );

  const nameCellRenderer = useLinkCellRenderer<Metric>(
    (row) => metricDetailsPage(row.id, row.configuration.name).href,
    (row) => row.configuration.name,
  );

  const { renderTableColumns, renderTableRows } = useTable({
    columns: [
      "name",
      "type",
      "createdAt",
      "updatedAt",
      { key: "actions", columnClassName: "w-0", cellClassName: "w-0" },
    ],
    key: "id",
    rows: props.items,
    cellRenderer: {
      name: nameCellRenderer,
      createdAt: dateCellRenderer,
      updatedAt: dateCellRenderer,
      type: typeRenderer,
      actions: actionsCellRenderer,
    },
    columnRenderer,
  });

  return (
    <Table
      aria-label={t("EvaluationMetricsTable.ariaLabel")}
      isHeaderSticky
      baseRef={scrollerRef}
      bottomContent={
        <TableLoadMoreSpinner loaderRef={loaderRef} show={props.hasMore} />
      }
      className="max-h-full"
    >
      <TableHeader>{renderTableColumns()}</TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
