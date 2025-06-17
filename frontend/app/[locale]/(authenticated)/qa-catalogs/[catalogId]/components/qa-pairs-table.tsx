import {
  addToast,
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import {
  MdDelete,
  MdEdit,
  MdOutlineRemoveRedEye,
  MdUndo,
} from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { PendingChange } from "@/app/[locale]/(authenticated)/qa-catalogs/hooks/use-qa-pairs";
import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import { NewQaPair, QaPair } from "@/app/client";
import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";
import { CellRenderFunction, useTable } from "@/app/hooks/use-table";

export type QaPairTableRow = {
  id: string;
  question: string;
  expectedOutput: string;
  contexts?: string[];
  metaData?: { [key: string]: unknown };
  actions?: string;
};

export type QaPairsTableProps = {
  items: QaPair[];
  hasMore: boolean;
  loadMore: () => void;
  pendingChanges: Record<string, PendingChange>;
  onEdit: (data: QaPair) => void;
  onAdd: (data: NewQaPair) => void;
  onDelete: (id: string) => void;
  onUndo: (id: string) => void;
  onEditRow: (row: QaPairTableRow) => void; // New prop for editing a row
  onViewRow: (row: QaPairTableRow) => void;
};

export const QaPairsTable = (props: QaPairsTableProps) => {
  const t = useTranslations();

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: props.hasMore,
    onLoadMore: props.loadMore,
  });

  const allItems = useMemo(() => {
    const pendingChanges = Object.entries(props.pendingChanges).reduce<{
      additions: QaPairTableRow[];
      editedItems: Record<string, QaPairTableRow>;
    }>(
      (acc, [id, change]) => {
        if (change.type === "add") {
          acc.additions.push({
            id,
            question: change.data.question || "",
            expectedOutput: change.data.expectedOutput || "",
            contexts: change.data.contexts || [],
          });
        }

        if (change.type === "edit") {
          acc.editedItems[id] = {
            ...change.data,
            question: change.data.question || "",
            expectedOutput: change.data.expectedOutput || "",
          };
        }

        return acc;
      },
      { additions: [], editedItems: {} },
    );

    const mergedItems = props.items.map(
      (item) => pendingChanges.editedItems[item.id] || item,
    );

    return [...pendingChanges.additions, ...mergedItems];
  }, [props.items, props.pendingChanges]);

  const columnRenderer = useI18nColumnRenderer<QaPair>("QaPairsTable.column");

  const contextCellRenderer: CellRenderFunction<QaPairTableRow, "contexts"> =
    useCallback((row) => {
      return (
        <ul className="list-disc list-inside">
          {row.contexts?.map((context, idx) => (
            <li key={idx} className="truncate max-w-[300px]">
              {context}
            </li>
          ))}
        </ul>
      );
    }, []);

  const actionsCellRenderer: CellRenderFunction<QaPairTableRow, "actions"> =
    useCallback(
      (row) => {
        const hasChanges = Boolean(props.pendingChanges[row.id]);
        const isDeleted = props.pendingChanges[row.id]?.type === "delete";

        return (
          <TableRowActions
            actions={[
              {
                icon: MdOutlineRemoveRedEye,
                tooltip: t("QaPairsTable.action.view"),
                color: "primary",
                isDisabled: isDeleted,
                onPress: () => {
                  props.onViewRow(row);
                },
              },
              {
                icon: MdEdit,
                tooltip: t("QaPairsTable.action.edit"),
                color: "primary",
                isDisabled: isDeleted,
                onPress: () => {
                  props.onEditRow(row);
                },
              },
              {
                icon: MdDelete,
                tooltip: t("QaPairsTable.action.delete"),
                color: "danger",
                isDisabled: isDeleted,
                onPress: () => props.onDelete(row.id),
              },
              {
                icon: MdUndo,
                tooltip: t("QaPairsTable.action.undo"),
                color: "warning",
                onPress: () => {
                  if (hasChanges) {
                    props.onUndo(row.id);
                    addToast({
                      title: t("QaPairsTable.changesUndone"),
                      color: "success",
                    });
                  }
                },
                isDisabled: !hasChanges,
              },
            ]}
          />
        );
      },
      [props, t],
    );

  const { columns, rows, renderTableColumn, renderTableCell } = useTable<
    QaPairTableRow,
    keyof QaPairTableRow
  >({
    columns: [
      "question",
      "expectedOutput",
      "contexts",
      { key: "actions", columnClassName: "w-0", cellClassName: "w-0" },
    ],
    rows: allItems,
    key: "id",
    columnRenderer,
    cellRenderer: {
      contexts: contextCellRenderer,
      actions: actionsCellRenderer,
    },
  });

  return (
    <Table
      aria-label={t("QaPairsTable.ariaLabel")}
      isHeaderSticky
      baseRef={scrollerRef}
      bottomContent={
        <TableLoadMoreSpinner loaderRef={loaderRef} show={props.hasMore} />
      }
      className="max-h-full"
    >
      <TableHeader columns={columns}>{renderTableColumn()}</TableHeader>
      <TableBody items={rows}>
        {(row) => {
          const changeType = props.pendingChanges[row.id]?.type;
          const isDeleted = changeType === "delete";
          const isEdited = changeType === "edit";
          const isAdded = changeType === "add";
          return (
            <TableRow
              key={row.id}
              className={cx(
                "content-table-row h-4",
                isDeleted &&
                  "line-through opacity-50 border-l-4 border-danger-500",
                isEdited && "border-l-4 border-primary-400",
                isAdded && "border-l-4 border-success-500",
              )}
            >
              {renderTableCell(row)}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
};
