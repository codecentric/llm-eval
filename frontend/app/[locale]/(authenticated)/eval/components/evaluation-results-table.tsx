"use client";

import { Table, TableBody, TableHeader } from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { GroupedEvaluationResult } from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import {
  CellRenderFunction,
  ExpansionContentRenderFunction,
  useTable,
} from "@/app/hooks/use-table";

import { MetricResultValueDisplay } from "./metric-result-value-display";
import { TestCaseGroupDetails } from "./test-case-group-details";

const METRIC_COLUMN_PREFIX = "metric_";

type EvaluationResultsTableProps = {
  evaluationId: string;
  results: GroupedEvaluationResult[];
  metrics: { id: string; name: string }[];
  hasMore: boolean;
  loadMore: () => Promise<void>;
};

export const EvaluationResultsTable = (props: EvaluationResultsTableProps) => {
  const t = useTranslations();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const columnRenderer = useI18nColumnRenderer<GroupedEvaluationResult>(
    "EvaluationResultsTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<GroupedEvaluationResult>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const configurationNameRenderer = useCallback<
    CellRenderFunction<GroupedEvaluationResult, "configurationName">
  >((row, column) => {
    return row[column] ?? row.configurationId;
  }, []);

  const expansionContentRenderer = useCallback<
    ExpansionContentRenderFunction<GroupedEvaluationResult>
  >(
    (row) => (
      <TestCaseGroupDetails
        evaluationId={props.evaluationId}
        testCases={row.testCases}
        metrics={props.metrics}
      />
    ),
    [props.evaluationId, props.metrics],
  );

  const metricResultsRenderer = useCallback<
    CellRenderFunction<GroupedEvaluationResult, string>
  >((row, column) => {
    const metricResult = row.metricResults?.find(
      (metricResult) =>
        metricResult.id === column.substring(METRIC_COLUMN_PREFIX.length),
    );
    return metricResult ? (
      <MetricResultValueDisplay metricResult={metricResult} />
    ) : null;
  }, []);

  const { renderTableColumns, renderTableRows } = useTable({
    columns: [
      "configurationName",
      { key: "configurationVersion", cellClassName: "text-nowrap" },
      { key: "createdAt", cellClassName: "text-nowrap" },
      {
        key: "input",
        noContainer: true,
        cellClassName:
          "overflow-hidden overflow-ellipsis whitespace-nowrap max-w-xs",
      },
      {
        key: "expectedOutput",
        noContainer: true,
        cellClassName:
          "overflow-hidden overflow-ellipsis whitespace-nowrap max-w-xs",
      },
      ...props.metrics.map((metric) => ({
        key: `${METRIC_COLUMN_PREFIX}${metric.id}`,
        name: metric.name,
      })),
    ],
    key: (_, index) => index.toString(),
    rows: props.results,
    cellRenderer: {
      configurationName:
        configurationNameRenderer as unknown as CellRenderFunction<
          GroupedEvaluationResult,
          string
        >,
      createdAt: dateCellRenderer as unknown as CellRenderFunction<
        GroupedEvaluationResult,
        string
      >,
      ...props.metrics.reduce(
        (acc, metric) => ({
          ...acc,
          [`${METRIC_COLUMN_PREFIX}${metric.id}`]: metricResultsRenderer,
        }),
        {},
      ),
    },
    columnRenderer,
    expandable: true,
    expansionContentRenderer,
  });

  return (
    <Table
      aria-label={t("EvaluationResultsTable.table.label")}
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
