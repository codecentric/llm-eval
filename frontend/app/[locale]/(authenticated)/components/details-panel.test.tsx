import { render, screen } from "@testing-library/react";

import { DetailsPanel } from "./details-panel";

describe("DetailsPanel", () => {
  describe.each(["light", "card"] as const)("using variant %s", (variant) => {
    it("should render the content", () => {
      render(
        <DetailsPanel title="Title" variant={variant}>
          My content
        </DetailsPanel>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("My content")).toBeInTheDocument();
    });

    it("should render title end content", () => {
      render(
        <DetailsPanel title="Title" variant={variant} titleEnd="Title end">
          My content
        </DetailsPanel>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("My content")).toBeInTheDocument();
      expect(screen.getByText("Title end")).toBeInTheDocument();
    });
  });
});
