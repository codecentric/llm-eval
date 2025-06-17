import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";

import Page from "./page";

describe("Documentation Page", () => {
  it("should render the documentation index", async () => {
    const page = await Page({ params: Promise.resolve({ locale: "en" }) });

    render(page);

    expect(
      screen.getByRole("listbox", { name: "DocumentationToc.label" }),
    ).toBeInTheDocument();
  });
});
