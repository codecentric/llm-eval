"use client";

import { addToast, Table, TableBody, TableHeader } from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { MdDelete, MdEdit, MdRemoveRedEye } from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { llmEndpointEditPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/edit/page-info";
import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { LlmEndpointFeatures } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-features";
import { useEndpointDelete } from "@/app/[locale]/(authenticated)/llm-endpoints/hooks/use-endpoint-delete";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import { LlmEndpoint, LlmEndpointsGetAllResponse } from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";
import { EditOrigin } from "@/app/types/edit-origin";

type LLMEndpointsTableProps = {
  items: LlmEndpointsGetAllResponse;
  hasMore: boolean;
  loadMore: () => Promise<unknown>;
};

export const LLMEndpointsTable = (props: LLMEndpointsTableProps) => {
  const t = useTranslations();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const { delete: deleteEndpoint } = useEndpointDelete({
    onSuccess: ({ message }) => {
      addToast({ title: message, color: "success" });
    },
  });

  const columnRenderer = useI18nColumnRenderer<LlmEndpoint>(
    "LLMEndpointsTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<LlmEndpoint>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const typeRenderer = useCallback<CellRenderFunction<LlmEndpoint, string>>(
    (row) => {
      return (
        <div className="flex flex-wrap min-w-24">
          {t(`llmEndpointType.${row.configuration.type}`)}
        </div>
      );
    },
    [t],
  );

  const featuresRenderer = useCallback<CellRenderFunction<LlmEndpoint, string>>(
    (row) => {
      return <LlmEndpointFeatures supportedFeatures={row.supportedFeatures} />;
    },
    [],
  );

  const actionsCellRenderer = useCallback<
    CellRenderFunction<LlmEndpoint, string>
  >(
    (row) => {
      return (
        <TableRowActions
          actions={[
            {
              icon: MdRemoveRedEye,
              href: llmEndpointDetailsPage(row.id, row.name).href,
              tooltip: t("LLMEndpointsTable.actions.view"),
            },
            {
              icon: MdEdit,
              href: llmEndpointEditPage({
                endpointId: row.id,
                name: row.name,
                origin: EditOrigin.LIST,
              }).href,
              tooltip: t("LLMEndpointsTable.actions.edit"),
            },
            {
              icon: MdDelete,
              onPress: () => deleteEndpoint(row),
              tooltip: t("LLMEndpointsTable.actions.delete"),
              color: "danger",
            },
          ]}
        />
      );
    },
    [t, deleteEndpoint],
  );

  const nameCellRenderer = useLinkCellRenderer<LlmEndpoint>(
    (row) => llmEndpointDetailsPage(row.id, row.name).href,
  );

  const { renderTableColumns, renderTableRows } = useTable({
    columns: [
      "name",
      "type",
      "features",
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
      features: featuresRenderer,
    },
    columnRenderer,
  });

  return (
    <Table
      aria-label={t("LLMEndpointsTable.ariaLabel")}
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
