import "@/app/test-utils/mock-intl";

import { render, screen, within } from "@testing-library/react";

import "@testing-library/jest-dom";
import {
  createListValueItem,
  PropertyList,
  PropertyListProps,
  Separator,
} from "./property-list";

describe("PropertyList", () => {
  it("should renders a list of basic property items", () => {
    const date = new Date();

    const items: PropertyListProps["items"] = [
      createListValueItem({
        label: "String",
        value: "ABC",
      }),
      createListValueItem({
        key: "num",
        label: "Number",
        value: 30,
      }),
      createListValueItem({
        key: "date",
        label: "Date",
        value: date,
      }),
      createListValueItem({
        key: "bool",
        label: "Boolean",
        value: true,
      }),
      createListValueItem({
        key: "null",
        label: "Null",
        value: null,
      }),
      createListValueItem({
        key: "undef",
        label: "Undefined",
        value: undefined,
      }),
      createListValueItem({
        key: "array",
        label: "Array",
        value: [1, 2, 3],
      }),
    ];

    mockFormatter.dateTime.mockReturnValue(date.toISOString());

    render(<PropertyList items={items} />);

    expectListItem("0", "String", "ABC");
    expectListItem("num", "Number", "30");
    expectListItem("date", "Date", date.toISOString());
    expectListItem("bool", "Boolean", "YesNo.yes");
    expectListItem("null", "Null", "-");
    expectListItem("undef", "Undefined", "-");
    expectListArrayItem("array", "Array", "1", "2", "3");
  });

  it("should render a separator", () => {
    const items: PropertyListProps["items"] = [
      createListValueItem({ label: "Name", value: "John Doe" }),
      Separator,
      createListValueItem({ label: "Age", value: 30 }),
    ];

    render(<PropertyList items={items} />);

    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(1);
  });

  it("should render full width items correctly", () => {
    const items: PropertyListProps["items"] = [
      createListValueItem({
        key: "1",
        label: "Name",
        value: "John Doe",
        fullWidth: true,
      }),
    ];

    render(<PropertyList items={items} />);

    const nameElement = screen.getByTestId("property-list-item-1");
    expect(nameElement).toHaveClass("col-span-2");
  });

  it("should render with custom render function", () => {
    const items: PropertyListProps["items"] = [
      createListValueItem({
        key: "1",
        label: "Name",
        value: "John Doe",
        renderValue: (value) => value.toUpperCase(),
      }),
    ];

    render(<PropertyList items={items} />);

    expectListItem("1", "Name", "JOHN DOE");
  });

  it("should render array with custom render function", () => {
    const items: PropertyListProps["items"] = [
      createListValueItem({
        key: "1",
        label: "Label",
        value: [1, 2, 3],
        renderValue: (value) => value.join("-"),
      }),
    ];

    render(<PropertyList items={items} />);

    expectListItem("1", "Label", "1-2-3");
  });

  it("should render array with custom item render function", () => {
    const items: PropertyListProps["items"] = [
      createListValueItem({
        key: "1",
        label: "Label",
        value: [1, 2, 3],
        renderArrayValue: (value) => value * 2,
      }),
    ];

    render(<PropertyList items={items} />);

    expectListArrayItem("1", "Label", "2", "4", "6");
  });

  const expectListItem = (key: string, label: string, value: string) => {
    const item = screen.getByTestId(`property-list-item-${key}`);

    expect(within(item).getByText(label)).toBeInTheDocument();
    expect(within(item).getByText(value)).toBeInTheDocument();
  };

  const expectListArrayItem = (
    key: string,
    label: string,
    ...values: string[]
  ) => {
    const item = screen.getByTestId(`property-list-item-${key}`);

    expect(within(item).getByText(label)).toBeInTheDocument();
    values.forEach((value) => {
      expect(within(item).getByText(value)).toBeInTheDocument();
    });
  };
});
