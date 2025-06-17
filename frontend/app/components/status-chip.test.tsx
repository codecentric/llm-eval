import { render, screen } from "@testing-library/react";

import { StatusChip } from "@/app/components/status-chip";

describe("StatusChip", () => {
  it("should render minimal chip", () => {
    render(<StatusChip />);

    const chip = screen.getByTestId("status-chip");
    const spinner = screen.queryByTestId("spinner");

    expect(chip).toBeInTheDocument();
    expect(spinner).not.toBeInTheDocument();
  });

  it("should render with all props", () => {
    render(
      <StatusChip
        size="sm"
        color="secondary"
        showSpinner={true}
        endContent={"end"}
      >
        content
      </StatusChip>,
    );

    const chip = screen.getByTestId("status-chip");
    const spinner = screen.getByTestId("spinner");

    expect(chip).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });
});
