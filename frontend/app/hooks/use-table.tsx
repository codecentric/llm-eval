import {
  TableCell,
  TableColumn as UiTableColumn,
  TableRow as UiTableRow,
} from "@heroui/react";
import { CellProps, ColumnProps, RowProps } from "@react-types/table";
import { cx } from "classix";
import { ReactElement, ReactNode, useCallback, useMemo, useState } from "react";

import { ExpandableTableRow } from "@/app/components/expandable-table-row";

export type TableRow<T> = T & { key: string };

type StringColumnKey<T> = {
  [K in keyof T]-?: T[K] extends string ? K : never;
}[keyof T];

type RowKeyFn<Row> = (row: Row, index: number) => string;
type RowKey<Row> = StringColumnKey<Row> | RowKeyFn<Row>;

export type TextAlign = "left" | "center" | "right";

export type ColumnDefinitionOptions = {
  textAlign?: TextAlign;
  nowrap?: boolean;
  useMinimumWidth?: boolean;
  noContainer?: boolean;
};

export type ColumnKey<T> = (keyof T | string) & TableColumnKey;
export type TableColumn<Row, Column extends ColumnKey<Row>> = {
  key: Column;
  columnClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
  name?: string;
} & ColumnDefinitionOptions;

function isTableColumn<Row, Column extends ColumnKey<Row>>(
  column: Column | TableColumn<Row, Column>,
): column is TableColumn<Row, Column> {
  return !!(column as TableColumn<Row, Column>).key;
}

const textAlignToClass = (textAlign?: TextAlign) =>
  textAlign === "center"
    ? "items-center"
    : textAlign === "right"
      ? "items-end"
      : "items-start";

const columnDefinitionOptionsToClasses = (
  options?: ColumnDefinitionOptions,
) => {
  const classes: string[] = [];
  const containerClasses: string[] = [];

  if (options) {
    const { textAlign, nowrap, useMinimumWidth } = options;

    containerClasses.push(textAlignToClass(textAlign));

    if (useMinimumWidth) {
      classes.push("w-0");
    }

    if (nowrap) {
      containerClasses.push("text-nowrap");
    }
  }

  return { classes, containerClasses };
};

type TableColumnKey = string | number | bigint;

type ColumnRenderFn<Row, Column extends ColumnKey<Row>> = (
  column: TableColumn<Row, Column>,
) => ReactNode;

type ColumnRenderer<Row, Column extends ColumnKey<Row>> =
  | {
      [K in Column | "default"]+?: K extends "default"
        ? ColumnRenderFn<Row, Column>
        : ColumnRenderFn<Row, K>;
    }
  | ColumnRenderFn<Row, Column>;

export type ColumnRenderFunction<
  Rows,
  Column extends ColumnKey<Rows> = ColumnKey<Rows>,
> = ColumnRenderFn<Rows, Column>;

type CellRenderFn<Row, Column extends ColumnKey<Row>> = (
  row: TableRow<Row>,
  column: Column,
) => ReactNode;

type CellRenderer<Row, Column extends ColumnKey<Row>> =
  | {
      [K in Column | "default"]+?: K extends "default"
        ? CellRenderFn<Row, Column>
        : CellRenderFn<Row, K>;
    }
  | CellRenderFn<Row, Column>;

export type CellRenderFunction<
  Rows,
  Column extends ColumnKey<Rows>,
> = CellRenderFn<Rows, Column>;

type RenderCellFn<Row> = (
  row: TableRow<Row>,
  column: TableColumnKey,
) => ReactNode;

type RenderColumnFn<Row, Column extends ColumnKey<Row>> = (
  column: TableColumn<Row, Column>,
) => ReactNode;

type RenderTableCellProps = { className?: string };
export type RenderTableCellFn<Row> = (
  row: TableRow<Row>,
  props?: RenderTableCellProps,
) => (columnKey: TableColumnKey) => ReactElement<CellProps>;

type RenderTableColumnProps = { className?: string };
type RenderTableColumnFn<Row, Column extends ColumnKey<Row>> = (
  props?: RenderTableColumnProps,
) => (
  columns: TableColumn<Row, Column>,
) => ReactElement<ColumnProps<TableColumn<Row, Column>>>;

type RenderTableColumnsFn<Row, Column extends ColumnKey<Row>> = (
  props?: RenderTableColumnProps,
) => ReactElement<ColumnProps<TableColumn<Row, Column>>>[];

type RenderTableRowProps = { cellClassName?: string };
type RenderTableRowsFn<Row> = (
  props?: RenderTableRowProps,
) => ReactElement<RowProps<Row>>[];

export type ExpansionContentRenderFunction<Row> = (row: Row) => ReactNode;

export type UseTableProps<Row, Column extends ColumnKey<Row>> = {
  columns: (Column | TableColumn<Row, Column>)[];
  rows: Row[];
  key: RowKey<Row>;
  cellRenderer?: CellRenderer<Row, Column>;
  columnRenderer?: ColumnRenderer<Row, Column>;
  expandable?: boolean;
  expansionContentRenderer?: ExpansionContentRenderFunction<Row>;
};

export type UseTableData<Row, Column extends ColumnKey<Row>> = {
  columns: TableColumn<Row, Column>[];
  rows: TableRow<Row>[];
  renderCell: RenderCellFn<Row>;
  renderTableCell: RenderTableCellFn<Row>;
  renderColumn: RenderColumnFn<Row, Column>;
  renderTableColumn: RenderTableColumnFn<Row, Column>;
  renderTableColumns: RenderTableColumnsFn<Row, Column>;
  renderTableRows: RenderTableRowsFn<Row>;
};

const useCellRenderer = <Row, Column extends ColumnKey<Row>>(
  cellRenderer?: CellRenderer<Row, Column>,
) =>
  useCallback(
    (row: TableRow<Row>, column: TableColumnKey): ReactNode => {
      if (typeof column === "number" || typeof column === "bigint") {
        return null;
      }

      const renderer =
        typeof cellRenderer === "function"
          ? cellRenderer
          : (cellRenderer?.[column as Column] ?? cellRenderer?.["default"]);

      if (renderer) {
        return renderer(row, column as Column);
      }

      const value = row?.[column as keyof Row] ?? null;

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "bigint"
      ) {
        return value.toString();
      }

      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(cellRenderer ?? {})],
  );

const useColumnRenderer = <Row, Column extends ColumnKey<Row>>(
  columnRenderer?: ColumnRenderer<Row, Column>,
) =>
  useCallback(
    (column: TableColumn<Row, Column>): ReactNode => {
      const renderer =
        typeof columnRenderer === "function"
          ? columnRenderer
          : (columnRenderer?.[column.key] ?? columnRenderer?.["default"]);

      if (renderer) {
        return renderer(column);
      }

      return column.key as string;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(columnRenderer ?? {})],
  );

const useRenderTableColumn = <Row, Column extends ColumnKey<Row>>(
  renderColumn: RenderColumnFn<Row, Column>,
) =>
  useCallback<RenderTableColumnFn<Row, Column>>(
    // eslint-disable-next-line react/display-name
    (props) => (column) => {
      const classes = columnDefinitionOptionsToClasses(column);
      return (
        <UiTableColumn
          key={column.key}
          className={cx(
            column.columnClassName,
            ...classes.classes,
            props?.className,
          )}
          allowsSorting={column.sortable}
        >
          {column.noContainer ? (
            renderColumn(column)
          ) : (
            <div
              className={cx(
                "inline-flex flex-col",
                ...classes.containerClasses,
              )}
            >
              {renderColumn(column)}
            </div>
          )}
        </UiTableColumn>
      );
    },
    [renderColumn],
  );

const useRenderTableColumns = <Row, Column extends ColumnKey<Row>>(
  columns: TableColumn<Row, Column>[],
  renderTableColumn: RenderTableColumnFn<Row, Column>,
  expandable?: boolean,
) =>
  useCallback<RenderTableColumnsFn<Row, Column>>(
    (props) => {
      return expandable
        ? [
            <UiTableColumn key="expand-placeholder"> </UiTableColumn>,
            ...columns.map((column) => renderTableColumn(props)(column)),
          ]
        : columns.map((column) => renderTableColumn(props)(column));
    },
    [expandable, columns, renderTableColumn],
  );

const useRenderTableCell = <Row, Column extends ColumnKey<Row>>(
  columns: TableColumn<Row, Column>[],
  renderCell: RenderCellFn<Row>,
) =>
  useCallback<RenderTableCellFn<Row>>(
    // eslint-disable-next-line react/display-name
    (row, props) => (columnKey) => {
      const column = columns.find((c) => c.key === columnKey);
      const classes = columnDefinitionOptionsToClasses(column);

      return (
        <TableCell
          className={cx(
            column?.cellClassName,
            ...classes.classes,
            props?.className,
          )}
          aria-label={columnKey.toString()}
        >
          {column?.noContainer ? (
            renderCell(row, columnKey)
          ) : (
            <div className={cx("flex flex-col", ...classes.containerClasses)}>
              {renderCell(row, columnKey)}
            </div>
          )}
        </TableCell>
      );
    },
    [columns, renderCell],
  );

const useRenderTableRows = <Row, Column extends ColumnKey<Row>>(
  rows: TableRow<Row>[],
  columns: TableColumn<Row, Column>[],
  renderTableCell: RenderTableCellFn<Row>,
  expansion?: {
    isExpanded: (row: TableRow<Row>) => boolean;
    toggleExpanded: (key: TableRow<Row>) => void;
    expansionContentRenderer: ExpansionContentRenderFunction<Row>;
  },
) => {
  return useCallback<RenderTableRowsFn<Row>>(
    (props) =>
      rows
        .map((item) =>
          expansion ? (
            ExpandableTableRow({
              expanded: expansion.isExpanded(item),
              toggleExpanded: () => expansion.toggleExpanded(item),
              row: item,
              columns,
              cellRenderer: renderTableCell,
              expansionContent: expansion.expansionContentRenderer(item),
              classNames: {
                base: "content-table-row",
                cell: props?.cellClassName,
              },
            })
          ) : (
            <UiTableRow key={item.key} className="content-table-row">
              {renderTableCell(item, { className: props?.cellClassName })}
            </UiTableRow>
          ),
        )
        .flat(),
    [rows, columns, renderTableCell, expansion],
  );
};

export const useTable = <Row, Column extends ColumnKey<Row>>({
  columns,
  rows,
  key,
  cellRenderer,
  columnRenderer,
  expandable,
  expansionContentRenderer,
}: UseTableProps<Row, Column>): UseTableData<Row, Column> => {
  const [expansionState, setExpansionState] = useState<
    Record<string, boolean | undefined>
  >({});

  const isExpanded = useCallback(
    (row: TableRow<Row>) => !!expansionState[row.key],
    [expansionState],
  );

  const toggleExpanded = useCallback(
    (row: TableRow<Row>) => {
      setExpansionState({
        ...expansionState,
        [row.key]: !expansionState[row.key],
      });
    },
    [expansionState, setExpansionState],
  );

  const tableColumns = columns.map((column) =>
    isTableColumn(column)
      ? column
      : {
          key: column,
        },
  );

  const mappedRows = useMemo(
    () =>
      rows.map<TableRow<Row>>((row, index) => {
        const k =
          typeof key === "function" ? key(row, index) : (row[key] as string);
        return {
          key: k,
          ...row,
        };
      }),
    [key, rows],
  );

  const renderCell = useCellRenderer(cellRenderer);
  const renderColumn = useColumnRenderer(columnRenderer);
  const renderTableColumn = useRenderTableColumn(renderColumn);
  const renderTableColumns = useRenderTableColumns(
    tableColumns,
    renderTableColumn,
    expandable,
  );
  const renderTableCell = useRenderTableCell(tableColumns, renderCell);
  const renderTableRows = useRenderTableRows(
    mappedRows,
    tableColumns,
    renderTableCell,
    expandable && expansionContentRenderer
      ? {
          expansionContentRenderer,
          toggleExpanded,
          isExpanded,
        }
      : undefined,
  );

  return {
    columns: tableColumns,
    rows: mappedRows,
    renderCell,
    renderTableCell,
    renderColumn,
    renderTableColumn,
    renderTableRows,
    renderTableColumns,
  };
};
