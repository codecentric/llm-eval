import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

import { SideBarNavList } from "./side-bar-nav-list";

const page1: PageInfo = {
  key: "page1",
  name: "Page1.name",
  href: "/",
};

const page2: PageInfo = {
  key: "page2",
  name: "Page2.name",
  href: "/page2",
};

describe("SideBarNavList", () => {
  it("should render list items", () => {
    const pages = [page1, page2];

    render(<SideBarNavList pages={pages} />);

    expect(screen.getByText("Page1.name")).toBeInTheDocument();
    expect(screen.getByText("Page2.name")).toBeInTheDocument();
  });

  it("should render list items with section header", () => {
    const pages = [page1, page2];

    render(<SideBarNavList pages={pages} section="Section Header" />);

    expect(screen.getByText("Section Header")).toBeInTheDocument();
  });

  it("should render active list item if segment matches", () => {
    const pages = [page1, page2];

    render(<SideBarNavList pages={pages} segment="page2" />);

    expect(screen.getByRole("option", { name: page1.name })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("option", { name: page2.name })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("should render active list item for home page if no segment is set", () => {
    const pages = [page1, page2];

    render(<SideBarNavList pages={pages} />);

    expect(screen.getByRole("option", { name: page1.name })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: page2.name })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
