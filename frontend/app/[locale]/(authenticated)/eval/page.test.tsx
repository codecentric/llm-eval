import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  evaluationsDelete,
  evaluationsGetAll,
  EvaluationStatus,
  GetAllEvaluationResult,
} from "@/app/client";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import { downloadEvaluationResults } from "./[evaluationId]/download";
import { evaluationEditPage } from "./[evaluationId]/edit/page-info";
import { evaluationPage } from "./[evaluationId]/page-info";
import { evaluationComparePage } from "./compare/page-info";
import { newEvaluationPage } from "./new/page-info";
import Page from "./page";

vi.mock("@/app/client");
vi.mock("./[evaluationId]/download");

describe("Evaluations Page", () => {
  const evaluations: GetAllEvaluationResult[] = [
    {
      id: "1",
      name: "Evaluation 1",
      createdAt: "2021-01-01T00:00:00Z",
      version: 1,
      status: EvaluationStatus.PENDING,
      catalog: {
        id: "1",
        name: "Catalog 1",
      },
      testCaseProgress: {
        total: 10,
        done: 10,
      },
      metricResults: [
        {
          id: "1",
          name: "Metric 1",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
      ],
    },
    {
      id: "2",
      name: "Evaluation 2",
      createdAt: "2021-01-01T00:00:00Z",
      version: 1,
      status: EvaluationStatus.SUCCESS,
      catalog: {
        id: "1",
        name: "Catalog 1",
      },
      testCaseProgress: {
        total: 10,
        done: 10,
      },
      metricResults: [
        {
          id: "1",
          name: "Metric 1",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
        {
          id: "2",
          name: "Metric 2",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
      ],
    },
    {
      id: "3",
      name: "Evaluation 3",
      createdAt: "2021-01-01T00:00:00Z",
      version: 1,
      status: EvaluationStatus.SUCCESS,
      catalog: {
        id: "1",
        name: "Catalog 1",
      },
      testCaseProgress: {
        total: 10,
        done: 10,
      },
      metricResults: [
        {
          id: "1",
          name: "Metric 1",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
        {
          id: "2",
          name: "Metric 2",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
      ],
    },
  ];

  it("should render evaluations", async () => {
    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const rows = screen.getAllByRole("row");

    expect(rows).toHaveLength(evaluations.length + 1);

    evaluations.forEach((evaluation, index) => {
      const withinRow = within(rows[index + 1]);

      expect(withinRow.getByText(evaluation.name)).toBeInTheDocument();
      if (evaluation.catalog) {
        expect(
          withinRow.getByText(evaluation.catalog.name),
        ).toBeInTheDocument();
      }
      expect(
        withinRow.getByRole("menuitem", {
          name: "ExecutionsTable.actions.view",
        }),
      ).toHaveAttribute(
        "href",
        evaluationPage({ evaluationId: evaluation.id }).href,
      );
      expect(
        withinRow.getByRole("menuitem", {
          name: "ExecutionsTable.actions.edit",
        }),
      ).toHaveAttribute(
        "href",
        evaluationEditPage({
          evaluationId: evaluation.id,
        }).href,
      );

      const downloadButton = withinRow.getByRole("menuitem", {
        name: "ExecutionsTable.actions.download",
      });
      expect(downloadButton).toBeInTheDocument();
      if (evaluation.status === EvaluationStatus.SUCCESS) {
        expect(downloadButton).toBeEnabled();
      } else {
        expect(downloadButton).toBeDisabled();
      }

      expect(
        withinRow.getByRole("menuitem", {
          name: "ExecutionsTable.actions.delete",
        }),
      ).toBeInTheDocument();
    });
  });

  it("shound have start evaluation button", async () => {
    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    expect(
      screen.getByRole("button", { name: "NewEvaluationPageAction.text" }),
    ).toHaveAttribute("href", newEvaluationPage().href);
  });

  it("should delete an evaluation", async () => {
    const user = userEvent.setup();

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );
    vi.mocked(evaluationsDelete).mockResolvedValue(
      successfulServiceResponse(undefined),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const deleteButton = (
      await screen.findAllByRole("menuitem", {
        name: "ExecutionsTable.actions.delete",
      })
    )[0];

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useEvaluationDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(evaluationsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: evaluations[0].version },
          path: {
            evaluation_id: evaluations[0].id,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: "useEvaluationDelete.delete.success",
        color: "success",
      });
    });
  });

  it("should download evaluation results", async () => {
    const user = userEvent.setup();

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const downloadButton = (
      await screen.findAllByRole("menuitem", {
        name: "ExecutionsTable.actions.download",
      })
    )[1];

    expect(downloadButton).toBeEnabled();

    await user.click(downloadButton);

    await waitFor(() => {
      expect(downloadEvaluationResults).toHaveBeenCalledWith(
        evaluations[1].id,
        {
          onStart: expect.any(Function),
          onFinish: expect.any(Function),
        },
      );
    });
  });

  it("should disable compare button when no evaluations are selected", async () => {
    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const compareButton = screen.getByRole("button", {
      name: "EvaluationsPage.action.compare",
    });

    expect(compareButton).toHaveAttribute("data-disabled", "true");
  });

  it("should disable compare button when one evaluation is selected", async () => {
    const user = userEvent.setup();

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const compareButton = screen.getByRole("button", {
      name: "EvaluationsPage.action.compare",
    });

    const rows = (await screen.findAllByRole("row")).slice(1);

    await user.click(rows[1]);

    expect(compareButton).toHaveAttribute("data-disabled", "true");
  });

  it("should disable compare button when two evaluations are selected, but they are not in status success", async () => {
    const user = userEvent.setup();

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const compareButton = screen.getByRole("button", {
      name: "EvaluationsPage.action.compare",
    });

    const rows = (await screen.findAllByRole("row")).slice(1);

    await user.click(rows[0]);
    await user.click(rows[1]);

    expect(compareButton).toHaveAttribute("data-disabled", "true");
  });

  it("should enable compare button when two evaluations are selected", async () => {
    const user = userEvent.setup();

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse(evaluations),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForRender();

    const compareButton = screen.getByRole("button", {
      name: "EvaluationsPage.action.compare",
    });

    const rows = (await screen.findAllByRole("row")).slice(1);

    await user.click(rows[1]);
    await user.click(rows[2]);

    expect(compareButton).not.toHaveAttribute("data-disabled");
    expect(compareButton).toHaveAttribute(
      "href",
      evaluationComparePage(["2", "3"]).href,
    );
  });

  const createPage = () => Page({ params: Promise.resolve({ locale: "en" }) });

  const waitForRender = async () => {
    await screen.findByRole("checkbox", { name: "Select All" });
  };
});
