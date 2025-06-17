import { Selection, SelectionMode, TableProps } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";

import { TableRow } from "./use-table";

export type UseTableSelectionProps<TItem> = {
  items: TableRow<TItem>[];
  selectionMode: SelectionMode;
  onSelectionChange?: (selectedItems: readonly TItem[]) => void;
  disabledKeys?: string[];
  defaultSelectedKeys?: string[];
};

type SelectionTableProps = Pick<
  TableProps,
  | "selectionMode"
  | "onSelectionChange"
  | "selectedKeys"
  | "defaultSelectedKeys"
  | "disabledKeys"
>;

export type UseTableSelection<TItem> = {
  selectionTableProps: SelectionTableProps;
  thClassName?: string;
  selectedItems: readonly TItem[];
};

export const useTableSelection = <TItem>({
  items,
  onSelectionChange,
  selectionMode,
  defaultSelectedKeys,
  disabledKeys,
}: UseTableSelectionProps<TItem>): UseTableSelection<TItem> => {
  const [selectedItems, setSelectedItems] = useState<
    readonly TableRow<TItem>[]
  >([]);

  const onSelectionChangeHandler = useCallback(
    (selection: Selection) => {
      let selectedItems: TableRow<TItem>[];

      if (selection === "all") {
        selectedItems = items;
      } else {
        selectedItems = items.filter((item) => selection.has(item.key));
      }

      setSelectedItems(selectedItems);

      if (onSelectionChange) {
        onSelectionChange(selectedItems);
      }
    },
    [items, onSelectionChange],
  );

  const selectedKeys = useMemo(
    () => selectedItems.map((item) => item.key),
    [selectedItems],
  );

  const selectionTableProps: SelectionTableProps = {
    selectionMode,
    onSelectionChange: onSelectionChangeHandler,
    disabledKeys,
    defaultSelectedKeys,
    selectedKeys,
  };

  return {
    selectionTableProps,
    selectedItems,
    thClassName: selectionMode && "first:w-0", // make checkbox column take minimum width
  };
};
