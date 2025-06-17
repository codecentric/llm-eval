import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";

import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";

describe("DisplayContentOrError", () => {
  it("should render an error if truthy", () => {
    const error = "ERROR";

    render(
      <DisplayContentOrError error={error}>CONTENT</DisplayContentOrError>,
    );

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByText("page.genericDataLoadError")).toBeInTheDocument();
    expect(screen.queryByText("CONTENT")).not.toBeInTheDocument();
  });

  it("should render an error with custom error message", () => {
    const error = "ERROR";
    const errorMessage = "ERROR MESSAGE";

    render(
      <DisplayContentOrError error={error} errorMessage={errorMessage}>
        CONTENT
      </DisplayContentOrError>,
    );

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText("CONTENT")).not.toBeInTheDocument();
  });

  it("should render the children if there is no error", () => {
    render(
      <DisplayContentOrError error={undefined}>CONTENT</DisplayContentOrError>,
    );

    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });
});
