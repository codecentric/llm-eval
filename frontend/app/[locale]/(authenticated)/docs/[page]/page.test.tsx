import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";

import Page from "./page";

describe("Specific Documentation Page", () => {
  it("should render a documentation page and the table of contents", async () => {
    const page = await Page({
      params: Promise.resolve({ locale: "en", page: "test" }),
    });

    render(page);

    expect(
      screen.getByRole("listbox", { name: "DocumentationToc.label" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "TestTitle" }),
    ).toBeInTheDocument();

    expect(screen.getByText("TestContent")).toBeInTheDocument();
  });
});
