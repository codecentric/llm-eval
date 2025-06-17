import {
  Table,
  TableBody,
  TableCell,
  TableColumn as UITableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  CellElement,
  CellRenderer,
  ColumnElement,
  ColumnRenderer,
} from "@react-types/table";
import { render, renderHook, screen } from "@testing-library/react";

import { TableColumn, useTable, UseTableProps } from "@/app/hooks/use-table";

type TestItem = { a: string; b: number; c: boolean; d: bigint; e: undefined };

describe("useTable", () => {
  const testData: TestItem[] = [
    { a: "1", b: 10, c: true, d: BigInt(100), e: undefined },
  ];

  const testColumns: (string | TableColumn<TestItem, string>)[] = [
    "a",
    {
      key: "b",
      columnClassName: "col-class",
      cellClassName: "cell-class",
      nowrap: true,
      sortable: true,
      textAlign: "right",
      useMinimumWidth: true,
    },
    {
      key: "c",
      columnClassName: "col-class",
      cellClassName: "cell-class",
      noContainer: true,
      nowrap: true,
      sortable: true,
      textAlign: "right",
      useMinimumWidth: true,
    },
  ];

  describe("columns", () => {
    it("should return the columns to use", () => {
      const { result } = renderTableHook();

      expect(result.current.columns).toEqual([
        { key: "a" },
        {
          key: "b",
          columnClassName: "col-class",
          cellClassName: "cell-class",
          nowrap: true,
          sortable: true,
          textAlign: "right",
          useMinimumWidth: true,
        },
        {
          key: "c",
          columnClassName: "col-class",
          cellClassName: "cell-class",
          noContainer: true,
          nowrap: true,
          sortable: true,
          textAlign: "right",
          useMinimumWidth: true,
        },
      ]);
    });
  });

  describe("renderCell", () => {
    it("should render string cells", () => {
      const { result } = renderTableHook();

      render(result.current.renderCell(result.current.rows[0], "a"));

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should render number cells", () => {
      const { result } = renderTableHook();

      render(result.current.renderCell(result.current.rows[0], "b"));

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should render boolean cells", () => {
      const { result } = renderTableHook();

      render(result.current.renderCell(result.current.rows[0], "c"));

      expect(screen.getByText("true")).toBeInTheDocument();
    });

    it("should render bigint cells", () => {
      const { result } = renderTableHook();

      render(result.current.renderCell(result.current.rows[0], "d"));

      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should render undefined cells", () => {
      const { result } = renderTableHook();

      const { container } = render(
        result.current.renderCell(result.current.rows[0], "e"),
      );

      expect(container?.innerHTML).toBe("");
    });

    it("should render with cell renderer", () => {
      const { result } = renderTableHook({
        cellRenderer: (row, column) => (
          <div>
            {row.key} - {column}
          </div>
        ),
      });

      render(result.current.renderCell(result.current.rows[0], "a"));

      expect(screen.getByText("1 - a")).toBeInTheDocument();
    });
  });

  describe("renderTableCell", () => {
    it("should render cell a", async () => {
      const { result } = renderTableHook();

      render(
        <CellWrapper>
          {result.current.renderTableCell(result.current.rows[0])("a")}
        </CellWrapper>,
      );

      expect(screen.getByRole("rowheader")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should render cell b", async () => {
      const { result } = renderTableHook();

      render(
        <CellWrapper>
          {result.current.renderTableCell(result.current.rows[0])("b")}
        </CellWrapper>,
      );

      expect(screen.getByRole("rowheader")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should render cell c", async () => {
      const { result } = renderTableHook();

      render(
        <CellWrapper>
          {result.current.renderTableCell(result.current.rows[0])("c")}
        </CellWrapper>,
      );

      expect(screen.getByRole("rowheader")).toBeInTheDocument();
      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });

  describe("renderColumn", () => {
    describe.each(testColumns.map((_, index) => index))(
      "column %#",
      (index) => {
        it("should render without renderer", () => {
          const { result } = renderTableHook();

          const column = result.current.columns[index];

          render(result.current.renderColumn(column));

          expect(screen.getByText(column.key)).toBeInTheDocument();
        });

        it("should render with renderer", () => {
          const { result } = renderTableHook({
            columnRenderer: (column) => {
              return column.key.toUpperCase();
            },
          });

          const column = result.current.columns[index];

          render(result.current.renderColumn(column));

          expect(
            screen.getByText(column.key.toUpperCase()),
          ).toBeInTheDocument();
        });
      },
    );
  });

  describe("renderTableColumn", () => {
    it.each(testColumns.map((_, index) => index))(
      "should render column %#",
      (index) => {
        const { result } = renderTableHook();

        const column = result.current.columns[index];

        render(
          <ColumnWrapper>
            {result.current.renderTableColumn()(column)}
          </ColumnWrapper>,
        );

        expect(screen.getByText(column.key)).toBeInTheDocument();
      },
    );
  });

  const CellWrapper = ({
    children,
  }: {
    children: CellElement | CellElement[] | CellRenderer;
  }) => (
    <Table aria-label="table">
      <TableHeader>
        <UITableColumn>A</UITableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="1">{children}</TableRow>
      </TableBody>
    </Table>
  );

  const ColumnWrapper = ({
    children,
  }: {
    children:
      | ColumnElement<unknown>
      | ColumnElement<unknown>[]
      | ColumnRenderer<unknown>;
  }) => (
    <Table aria-label="table">
      <TableHeader>{children}</TableHeader>
      <TableBody>
        <TableRow key="1">
          <TableCell>X</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  const renderTableHook = (
    props?: Pick<
      UseTableProps<TestItem, string>,
      "columnRenderer" | "cellRenderer"
    >,
  ) =>
    renderHook(() =>
      useTable({
        columns: testColumns,
        rows: testData,
        key: "a",
        ...props,
      }),
    );
});
