import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("should render the dialog with the correct header and description", () => {
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={() => {}}
        onOk={() => {}}
      />,
    );

    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should call onOk when the OK button is clicked", async () => {
    const user = userEvent.setup();

    const onOk = vi.fn();
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={() => {}}
        onOk={onOk}
        okButtonLabel="ConfirmButton"
      />,
    );

    await user.click(screen.getByRole("button", { name: "ConfirmButton" }));

    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when the Cancel button is clicked", async () => {
    const user = userEvent.setup();

    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={onCancel}
        onOk={() => {}}
        cancelButtonLabel="Cancel"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should not render the dialog when open is false", () => {
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={false}
        onCancel={() => {}}
        onOk={() => {}}
      />,
    );

    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("should not render the cancel button when noCancel is true", () => {
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={() => {}}
        onOk={() => {}}
        noCancel={true}
        cancelButtonLabel="Cancel"
      />,
    );

    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("should render the error message when error is provided", () => {
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={() => {}}
        onOk={() => {}}
        error="An error occurred"
        errorTitle="Error title"
      />,
    );

    expect(screen.getByText("Error title")).toBeInTheDocument();
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("should render a loading spinner when okButtonLoading is true", () => {
    render(
      <ConfirmDialog
        header="Confirm"
        description="Are you sure?"
        open={true}
        onCancel={() => {}}
        onOk={() => {}}
        okButtonLoading={true}
        okButtonLabel="ConfirmButton"
      />,
    );

    expect(screen.getByText("ConfirmButton")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });
});
