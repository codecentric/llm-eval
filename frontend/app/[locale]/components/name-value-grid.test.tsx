import { render, screen } from "@testing-library/react";

import { NameValueGrid, NameValueGridItem } from "./name-value-grid";

describe("NameValueGrid", () => {
  it("should render name-value pairs", async () => {
    const items: NameValueGridItem[] = [
      {
        key: "1",
        name: "Name 1",
        value: "Value 1",
      },
      {
        key: "2",
        name: "Name 2",
        value: <div>Value 2</div>,
      },
    ];

    render(<NameValueGrid items={items} />);

    expect(screen.getByText("Name 1")).toBeInTheDocument();
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Name 2")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
  });
});
