import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";

import { YesNo } from "@/app/[locale]/components/yes-no";

describe("YesNo", () => {
  it("should render 'yes' if value is true", () => {
    render(<YesNo value={true} />);

    expect(screen.getByText("YesNo.yes")).toBeInTheDocument();
  });

  it.each([false, undefined])("should render 'no' if value is %s", (value) => {
    render(<YesNo value={value} />);

    expect(screen.getByText("YesNo.no")).toBeInTheDocument();
  });
});
