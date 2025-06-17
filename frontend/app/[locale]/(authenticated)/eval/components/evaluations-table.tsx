"use client";

import { addToast, Table, TableBody, TableHeader } from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import {
  MdDelete,
  MdEdit,
  MdFileDownload,
  MdRemoveRedEye,
} from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { downloadEvaluationResults } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/download";
import { evaluationEditPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/edit/page-info";
import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { EvaluationListItemStatus } from "@/app/[locale]/(authenticated)/eval/components/evaluation-list-item-status";
import { useEvaluationDelete } from "@/app/[locale]/(authenticated)/eval/hooks/use-evaluation-delete";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import {
  EvaluationsGetAllResponse,
  EvaluationStatus,
  GetAllEvaluationResult,
} from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";
import {
  useTableSelection,
  UseTableSelectionProps,
} from "@/app/hooks/use-table-selection";

import { MetricResultsBox } from "./metric-results-box";

type ExecutionsResultsTableProps = {
  items: EvaluationsGetAllResponse;
  hasMore: boolean;
  loadMore: () => Promise<unknown>;
  onSelectionChange?: UseTableSelectionProps<GetAllEvaluationResult>["onSelectionChange"];
};

export const EvaluationsTable = (props: ExecutionsResultsTableProps) => {
  const t = useTranslations();
  const [downloading, setDownloading] = useState<
    Record<string, boolean | undefined>
  >({});

  const { delete: deleteEvaluation } = useEvaluationDelete({
    onSuccess: ({ message }) => {
      addToast({ title: message, color: "success" });
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const columnRenderer = useI18nColumnRenderer<GetAllEvaluationResult>(
    "ExecutionsTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<GetAllEvaluationResult>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const actionsCellRenderer = useCallback<
    CellRenderFunction<GetAllEvaluationResult, string>
  >(
    (row) => (
      <TableRowActions
        actions={[
          {
            icon: MdRemoveRedEye,
            href: evaluationPage({ evaluationId: row.id }).href,
            tooltip: t("ExecutionsTable.actions.view"),
          },
          {
            icon: MdEdit,
            href: evaluationEditPage({ evaluationId: row.id }).href,
            tooltip: t("ExecutionsTable.actions.edit"),
          },
          {
            icon: MdFileDownload,
            onPress: () =>
              downloadEvaluationResults(row.id, {
                onStart: async () => {
                  setDownloading({ ...downloading, [row.id]: true });
                },
                onFinish: async () => {
                  setDownloading({ ...downloading, [row.id]: undefined });
                },
              }),
            tooltip: t("ExecutionsTable.actions.download"),
            isLoading: downloading[row.id],
            isDisabled: row.status !== EvaluationStatus.SUCCESS,
          },
          {
            icon: MdDelete,
            onPress: () => deleteEvaluation(row),
            tooltip: t("ExecutionsTable.actions.delete"),
            color: "danger",
          },
        ]}
      />
    ),
    [t, downloading, setDownloading, deleteEvaluation],
  );

  const nameCellRenderer = useLinkCellRenderer<GetAllEvaluationResult>(
    (row) => evaluationPage({ evaluationId: row.id }).href,
  );

  const qaCatalogCellRenderer = useLinkCellRenderer<GetAllEvaluationResult>(
    (row) =>
      row.catalog?.id ? qaCatalogDetailPage(row.catalog.id).href : undefined,
    (row) => row.catalog?.name,
  );

  const resultCellRenderer = useCallback<
    CellRenderFunction<GetAllEvaluationResult, string>
  >(
    (row) => (
      <MetricResultsBox className="w-full" metricResults={row.metricResults} />
    ),
    [],
  );

  const statusRenderer = useCallback<
    CellRenderFunction<GetAllEvaluationResult, "status">
  >((row) => <EvaluationListItemStatus row={row} />, []);

  const { renderTableColumns, renderTableRows, rows } = useTable({
    columns: [
      "name",
      "catalog",
      {
        key: "createdAt",
        nowrap: true,
        useMinimumWidth: true,
      },
      {
        key: "status",
        useMinimumWidth: true,
        nowrap: true,
        textAlign: "left",
      },
      {
        key: "result",
        useMinimumWidth: true,
        nowrap: true,
        textAlign: "center",
      },
      {
        key: "actions",
        useMinimumWidth: true,
        nowrap: true,
        textAlign: "right",
      },
    ],
    key: "id",
    rows: props.items,
    cellRenderer: {
      name: nameCellRenderer,
      catalog: qaCatalogCellRenderer,
      createdAt: dateCellRenderer,
      result: resultCellRenderer,
      actions: actionsCellRenderer,
      status: statusRenderer,
    },
    columnRenderer,
  });

  const { selectionTableProps, thClassName } = useTableSelection({
    items: rows,
    selectionMode: "multiple",
    onSelectionChange: props.onSelectionChange,
  });

  return (
    <Table
      aria-label={t("ExecutionsTable.ariaLabel")}
      isHeaderSticky
      baseRef={scrollerRef}
      bottomContent={
        <TableLoadMoreSpinner loaderRef={loaderRef} show={props.hasMore} />
      }
      className="max-h-full"
      classNames={{
        th: thClassName,
      }}
      {...selectionTableProps}
    >
      <TableHeader>{renderTableColumns()}</TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
