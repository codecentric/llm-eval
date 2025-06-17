import {
  Button,
  Divider,
  Spinner,
  Table,
  TableBody,
  TableHeader,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdSearch } from "react-icons/md";
import { z } from "zod";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import {
  EVALUATIONS_QUERY_BASE_KEY,
  evaluationsQueryDefinition,
  EvaluationsQueryParams,
} from "@/app/[locale]/(authenticated)/eval/queries";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { ErrorDisplay } from "@/app/[locale]/components/error-display";
import { FormDatePicker } from "@/app/[locale]/components/form-date-picker";
import { FormInput } from "@/app/[locale]/components/form-input";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import { GetAllEvaluationResult } from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";
import { useTableSelection } from "@/app/hooks/use-table-selection";
import { clientInfiniteQueryOptions } from "@/app/utils/react-query/client";
import { zonedDateTime } from "@/app/utils/zod";

import { EvaluationListItemStatus } from "./evaluation-list-item-status";

const queryFormSchema = z.object({
  query: z.string().optional(),
  from: zonedDateTime().nullable(),
  to: zonedDateTime().nullable(),
});

type FormData = z.infer<typeof queryFormSchema>;

type EvaluationQueryFormProps = {
  onSubmit: SubmitHandler<FormData>;
};

const EvaluationQueryForm: React.FC<EvaluationQueryFormProps> = ({
  onSubmit,
}) => {
  const t = useTranslations();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      query: "",
      from: null,
      to: null,
    },
  });

  const referenceDateTime = parseAbsoluteToLocal("2025-01-01T00:00:00Z");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormInput
        control={control}
        name="query"
        placeholder={t("EvaluationQueryForm.query.placeholder")}
        variant="bordered"
        endContent={
          <Button
            type="submit"
            variant="light"
            isIconOnly
            radius="full"
            size="sm"
            className="data-[hover=true]:bg-default/40 min-w-8 w-8 h-8 -mx-2 text-default-400"
          >
            <MdSearch size={24} />
          </Button>
        }
      />

      <div className="flex gap-2 mt-2">
        <FormDatePicker
          control={control}
          name="from"
          hideTimeZone
          showMonthAndYearPickers
          label={t("EvaluationQueryForm.from.label")}
          variant="bordered"
          placeholderValue={referenceDateTime}
          granularity="second"
        />
        <FormDatePicker
          control={control}
          name="to"
          hideTimeZone
          showMonthAndYearPickers
          label={t("EvaluationQueryForm.to.label")}
          variant="bordered"
          placeholderValue={referenceDateTime.set({ millisecond: 999 })}
          granularity="second"
        />
      </div>
    </form>
  );
};

type EvaluationResultsTableProps = {
  queryParams?: EvaluationsQueryParams;
  onSelectionChange?: (evaluationIds: string[]) => void;
  disabledEvaluations?: string[];
  allowSelection?: (evaluation: GetAllEvaluationResult) => boolean;
};

const EvaluationResultsTable: React.FC<EvaluationResultsTableProps> = ({
  queryParams,
  onSelectionChange,
  disabledEvaluations,
  allowSelection,
}) => {
  const t = useTranslations();

  const { data, error, hasNextPage, fetchNextPage, isLoading } =
    useInfiniteQuery(
      clientInfiniteQueryOptions(evaluationsQueryDefinition(queryParams), {
        enabled: !!queryParams,
      }),
    );

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  const columnRenderer = useI18nColumnRenderer<GetAllEvaluationResult>(
    "ExecutionsTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<GetAllEvaluationResult>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const nameCellRenderer = useLinkCellRenderer<GetAllEvaluationResult>(
    (row) => evaluationPage({ evaluationId: row.id }).href,
  );

  const qaCatalogCellRenderer = useLinkCellRenderer<GetAllEvaluationResult>(
    (row) =>
      row.catalog?.id ? qaCatalogDetailPage(row.catalog.id).href : undefined,
    (row) => row.catalog?.name,
  );

  const statusRenderer = useCallback<
    CellRenderFunction<GetAllEvaluationResult, "status">
  >((row) => <EvaluationListItemStatus row={row} />, []);

  const { renderTableRows, renderTableColumns, rows } = useTable({
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
    ],
    key: "id",
    rows: data ?? [],
    cellRenderer: {
      name: nameCellRenderer,
      catalog: qaCatalogCellRenderer,
      createdAt: dateCellRenderer,
      status: statusRenderer,
    },
    columnRenderer,
  });

  const selectionChange = useCallback(
    (selectedItems: readonly GetAllEvaluationResult[]) => {
      onSelectionChange?.(selectedItems.map((item) => item.id));
    },
    [onSelectionChange],
  );

  const disabledKeys = useMemo(
    () =>
      data
        ?.filter((evaluation) => {
          if (allowSelection) {
            return !allowSelection(evaluation);
          }

          return disabledEvaluations?.includes(evaluation.id) ?? false;
        })
        .map((evaluation) => evaluation.id),
    [disabledEvaluations, allowSelection, data],
  );

  const { selectionTableProps, thClassName } = useTableSelection({
    items: rows,
    selectionMode: "multiple",
    disabledKeys,
    onSelectionChange: selectionChange,
  });

  return (
    <>
      {error && (
        <ErrorDisplay
          className="mt-3"
          message={t("EvaluationResultsTable.error")}
          error={error}
        />
      )}
      <div className="relative h-80">
        <Table
          aria-label={t("EvaluationResultsTable.ariaLabel")}
          isHeaderSticky
          baseRef={scrollerRef}
          bottomContent={
            <TableLoadMoreSpinner loaderRef={loaderRef} show={hasNextPage} />
          }
          removeWrapper
          classNames={{
            base: [
              "h-80",
              "overflow-auto",
              "px-3",
              "pt-3",
              "absolute",
              "top-0",
              "-left-[.75rem]",
              "w-[calc(100%+1.5rem)]",
            ],
            table: !data?.length && "h-full",
            th: thClassName,
          }}
          {...selectionTableProps}
        >
          <TableHeader>{renderTableColumns()}</TableHeader>
          <TableBody
            emptyContent={t("EvaluationResultsTable.noResults")}
            isLoading={isLoading}
            loadingContent={<Spinner color="secondary" />}
          >
            {renderTableRows()}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export type EvaluationSelectionProps = Pick<
  EvaluationResultsTableProps,
  "allowSelection" | "onSelectionChange" | "disabledEvaluations"
>;

export const EvaluationSelection: React.FC<EvaluationSelectionProps> = ({
  disabledEvaluations,
  onSelectionChange,
  allowSelection,
}) => {
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<
    EvaluationsQueryParams | undefined
  >();

  useEffect(() => {
    queryClient.resetQueries({ queryKey: [EVALUATIONS_QUERY_BASE_KEY] });
  }, [queryClient]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setQueryParams({
      query: data.query,
      from: data.from?.toDate(),
      to: data.to?.toDate(),
    });
  };

  return (
    <div>
      <EvaluationQueryForm onSubmit={onSubmit} />
      <Divider className="mt-3" />
      <EvaluationResultsTable
        queryParams={queryParams}
        onSelectionChange={onSelectionChange}
        disabledEvaluations={disabledEvaluations}
        allowSelection={allowSelection}
      />
    </div>
  );
};
