import { render, screen } from "@testing-library/react";

import { TableLoadMoreSpinner } from "@/app/components/table-load-more-spinner";

describe("TableLoadMoreSpinner", () => {
  it("should render if show is true", () => {
    const ref = { current: {} as HTMLElement };

    render(<TableLoadMoreSpinner loaderRef={ref} show={true} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should not render if show is false", () => {
    const ref = { current: {} as HTMLElement };

    render(<TableLoadMoreSpinner loaderRef={ref} show={false} />);

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
