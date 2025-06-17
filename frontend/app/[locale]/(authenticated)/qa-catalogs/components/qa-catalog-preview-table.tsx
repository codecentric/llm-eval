"use client";

import { addToast, Table, TableBody, TableHeader } from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { MdDelete, MdPlayArrow, MdRemoveRedEye } from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { newEvaluationPage } from "@/app/[locale]/(authenticated)/eval/new/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { useQaCatalogDelete } from "@/app/[locale]/(authenticated)/qa-catalogs/hooks/use-qa-catalog-delete";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import {
  FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  useI18nDateCellRenderer,
} from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { useLinkCellRenderer } from "@/app/[locale]/hooks/use-link-cell-renderer";
import { QaCatalogPreview } from "@/app/client/types.gen";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";

import { QACatalogsListItemStatus } from "./qa-catalogs-list-item-status";

export type QACatalogPreviewTableProps = {
  className?: string;
  items: QaCatalogPreview[];
  hasMore: boolean;
  loadMore: () => Promise<unknown>;
};

export const QACatalogPreviewTable = (props: QACatalogPreviewTableProps) => {
  const t = useTranslations();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const { delete: deleteQaCatalog } = useQaCatalogDelete({
    onSuccess: ({ message }) => {
      addToast({
        title: message,
        color: "success",
      });
    },
  });

  const columnRenderer = useI18nColumnRenderer<QaCatalogPreview>(
    "QACatalogPreviewTable.column",
  );

  const dateCellRenderer = useI18nDateCellRenderer<QaCatalogPreview>(
    FULL_NUMERIC_DATE_FORMAT_OPTIONS,
  );

  const nameCellRenderer = useLinkCellRenderer<QaCatalogPreview>(
    (row) => qaCatalogDetailPage(row.id).href,
  );

  const statusRenderer = useCallback<
    CellRenderFunction<QaCatalogPreview, "status">
  >((row) => <QACatalogsListItemStatus row={row} />, []);

  const actionsCellRenderer = useCallback<
    CellRenderFunction<QaCatalogPreview, string>
  >(
    (row) => {
      return (
        <TableRowActions
          actions={[
            {
              icon: MdRemoveRedEye,
              href: qaCatalogDetailPage(row.id).href,
              tooltip: t("QACatalogPreviewTable.action.detail"),
            },
            {
              icon: MdPlayArrow,
              tooltip: t("QACatalogPreviewTable.action.runExecution"),
              color: "primary",
              href: newEvaluationPage({
                catalogId: row.id,
                origin: StartEvalOrigin.CATALOGS,
              }).href,
            },
            {
              icon: MdDelete,
              onPress: () => deleteQaCatalog(row),
              tooltip: t("QACatalogPreviewTable.action.delete"),
              color: "danger",
            },
          ]}
        />
      );
    },
    [t, deleteQaCatalog],
  );

  const { renderTableColumns, renderTableRows } = useTable({
    columns: [
      "name",
      "length",
      "createdAt",
      "updatedAt",
      { key: "status", useMinimumWidth: true },
      { key: "actions", columnClassName: "w-0", cellClassName: "w-0" },
    ],
    rows: props.items,
    key: "id",
    columnRenderer,
    cellRenderer: {
      actions: actionsCellRenderer,
      name: nameCellRenderer,
      createdAt: dateCellRenderer,
      updatedAt: dateCellRenderer,
      status: statusRenderer,
    },
  });

  return (
    <Table
      aria-label={t("QACatalogPreviewTable.ariaLabel")}
      isHeaderSticky
      baseRef={scrollerRef}
      bottomContent={
        <TableLoadMoreSpinner loaderRef={loaderRef} show={props.hasMore} />
      }
      className={props.className}
    >
      <TableHeader>{renderTableColumns()}</TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
