import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import { ErrorDisplay } from "@/app/[locale]/components/error-display";
import { HttpValidationError } from "@/app/client";
import { ResponseError } from "@/app/utils/backend-client/exception-handler";

describe("ErrorDisplay", () => {
  const testMessage = "This is an error message";

  it("should render the error card with only a message", () => {
    render(<ErrorDisplay message={testMessage} />);

    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it("should render the error card with a response validation error", async () => {
    const user = userEvent.setup();

    const error: ResponseError = {
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      error: { detail: [] },
    };

    render(<ErrorDisplay message={testMessage} error={error} />);

    expect(
      screen.getByText("ErrorDisplay.validationError"),
    ).toBeInTheDocument();

    const expandButton = screen.getByRole("button");

    await user.click(expandButton);

    expect(screen.getByTestId("error-details")).toHaveTextContent("[]");
  });

  it("should render the error card with a response internal server error", async () => {
    const user = userEvent.setup();

    const error: ResponseError = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Blah",
    };

    render(<ErrorDisplay message={testMessage} error={error} />);

    expect(
      screen.getByText("ErrorDisplay.internalServerError"),
    ).toBeInTheDocument();

    const expandButton = screen.getByRole("button");

    await user.click(expandButton);

    expect(screen.getByTestId("error-details")).toHaveTextContent("Blah");
  });

  it.each(
    Object.values(StatusCodes)
      .filter((code) => typeof code === "number")
      .filter(
        (
          code,
        ): code is Exclude<
          `${StatusCodes}`,
          | typeof StatusCodes.INTERNAL_SERVER_ERROR
          | typeof StatusCodes.UNPROCESSABLE_ENTITY
          | string
        > =>
          !(
            [
              StatusCodes.ACCEPTED,
              StatusCodes.UNPROCESSABLE_ENTITY,
              StatusCodes.INTERNAL_SERVER_ERROR,
            ] as StatusCodes[]
          ).includes(code),
      ),
  )(
    "should render the error card with a response status error for status %s",
    async (code) => {
      const user = userEvent.setup();

      const error: ResponseError = {
        status: code,
        error: { detail: "Blah" },
      };

      render(<ErrorDisplay message={testMessage} error={error} />);

      expect(screen.getByText("Blah")).toBeInTheDocument();

      const expandButton = screen.getByRole("button");

      await user.click(expandButton);

      expect(screen.getByTestId("error-details")).toHaveTextContent(
        `ErrorDisplay.statusCode: ${code} ErrorDisplay.reason: ${getReasonPhrase(code)}`,
      );
    },
  );

  it("should render the error card with a HttpValidationError", () => {
    const error: HttpValidationError = { detail: [] };

    render(<ErrorDisplay message={testMessage} error={error} />);

    expect(screen.getByTestId("error-details")).toHaveTextContent(/\[.*]/);
  });

  it("should render the error card with a string error", () => {
    const error = "ERROR";

    render(<ErrorDisplay message={testMessage} error={error} />);

    expect(screen.getByTestId("error-details")).toHaveTextContent(error);
  });

  it("should render the error card with an unknown error", () => {
    const error = true;

    render(<ErrorDisplay message={testMessage} error={error} />);

    expect(screen.getByTestId("error-details")).toHaveTextContent("true");
  });
});
