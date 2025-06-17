import { TRANSITION_VARIANTS } from "@heroui/framer-utils";
import { TableCell, TableRow as UiTableRow } from "@heroui/react";
import { cx } from "classix";
import { LazyMotion, motion, type Variants } from "framer-motion";
import { cloneElement, ReactNode } from "react";

import {
  ColumnKey,
  RenderTableCellFn,
  TableColumn,
  TableRow,
} from "@/app/hooks/use-table";

import { ExpandTableRowButton } from "./expand-table-row-button";

const domAnimation = () =>
  import("@heroui/dom-animation").then((res) => res.default);

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: "hidden" },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: "unset" },
};

export type ExpandableTableRowProps<Row, Column extends ColumnKey<Row>> = {
  className?: string;
  classNames?: {
    base?: string;
    expandedRow?: string;
    expansionCell?: string;
    cell?: string;
  };
  expanded: boolean;
  toggleExpanded: () => void;
  row: TableRow<Row>;
  columns: TableColumn<Row, Column>[];
  expansionContent?: ReactNode;
  cellRenderer: RenderTableCellFn<Row>;
};

export const ExpandableTableRow = <Row, Column extends ColumnKey<Row>>({
  className,
  classNames,
  expanded,
  toggleExpanded,
  row,
  expansionContent,
  columns,
  cellRenderer,
}: ExpandableTableRowProps<Row, Column>) => {
  return [
    <UiTableRow key={row.key} className={cx(classNames?.base, className)}>
      {[
        <TableCell
          key="expansion-button"
          className={cx("px-0", classNames?.cell)}
        >
          <ExpandTableRowButton expanded={expanded} onPress={toggleExpanded} />
        </TableCell>,
        ...columns.map((column) =>
          cloneElement(
            cellRenderer(row, { className: classNames?.cell })(column.key),
            {
              key: column.key,
            },
          ),
        ),
      ]}
    </UiTableRow>,
    <UiTableRow
      key={`${row.key}_expand`}
      className={cx(classNames?.expandedRow, className)}
    >
      {[
        <TableCell
          key="expansion-content"
          colSpan={columns.length + 1}
          className={cx("py-0", classNames?.expansionCell)}
        >
          <LazyMotion features={domAnimation}>
            <motion.div
              animate={expanded ? "enter" : "exit"}
              exit="exit"
              initial="exit"
              variants={transitionVariants}
            >
              <div className="py-2">{expansionContent ?? null}</div>
            </motion.div>
          </LazyMotion>
        </TableCell>,
      ]}
    </UiTableRow>,
  ];
};
