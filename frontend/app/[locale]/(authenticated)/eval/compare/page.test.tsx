import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";

import { parseAbsoluteToLocal } from "@internationalized/date";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import {
  EvaluationDetailSummary,
  evaluationsGetAll,
  evaluationsGetEvaluationDetailSummary,
  EvaluationStatus,
  GetAllEvaluationResult,
} from "@/app/client";
import { setDatePickerValue } from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { waitForPageRender } from "@/app/test-utils/wait-for-page";

import Page from "./page";
import { evaluationComparePage } from "./page-info";

vi.mock("@/app/client");

describe("Evaluation Compare Page", () => {
  it("should render the page with multiple evaluations", async () => {
    const evaluations = [
      createEvaluationSummary("e1"),
      createEvaluationSummary("e2"),
    ];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    evaluations.forEach((evaluation) => {
      expect(screen.getByText(evaluation.name)).toBeInTheDocument();
    });
  });

  it("should have details button with link to evaluation details on every information panel", async () => {
    const evaluations = [
      createEvaluationSummary("e1"),
      createEvaluationSummary("e2"),
    ];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    evaluations.forEach((evaluation) => {
      const detailsButton = screen.getByRole("button", {
        name: `EvaluationInformationPanel.detailsButton.ariaLabel - {"name":"${evaluation.name}"}`,
      });

      expect(detailsButton).toBeInTheDocument();
      expect(detailsButton).toHaveAttribute(
        "href",
        evaluationPage({ evaluationId: evaluation.id }).href,
      );
    });
  });

  it("should have remove button on every information panel", async () => {
    const evaluations = [
      createEvaluationSummary("e1"),
      createEvaluationSummary("e2"),
    ];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    evaluations.forEach((evaluation) => {
      const removeButton = screen.getByRole("button", {
        name: `EvaluationInformationPanel.remove.ariaLabel - {"name":"${evaluation.name}"}`,
      });

      expect(removeButton).toBeInTheDocument();
    });
  });

  it("should remove evaluation from compare", async () => {
    const user = userEvent.setup();

    const evaluations = [
      createEvaluationSummary("e1"),
      createEvaluationSummary("e2"),
    ];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    const removeButton = screen.getByRole("button", {
      name: `EvaluationInformationPanel.remove.ariaLabel - {"name":"${evaluations[1].name}"}`,
    });

    await user.click(removeButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      evaluationComparePage([evaluations[0].id]).href,
    );
  });

  it("should show add evaluations popup if only one evaluation is selected", async () => {
    const evaluations = [createEvaluationSummary("e1")];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    expect(
      await screen.findByLabelText(
        "EvaluationSelectionPopover.dialog.ariaLabel",
      ),
    ).toBeInTheDocument();
  });

  it("should disable remove button for last evaluation", async () => {
    const user = userEvent.setup();

    const evaluations = [createEvaluationSummary("e1")];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    expect(
      await screen.findByLabelText(
        "EvaluationSelectionPopover.dialog.ariaLabel",
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "EvaluationSelectionPopoverContent.cancel",
      }),
    );

    const removeButton = screen.getByRole("button", {
      name: `EvaluationInformationPanel.remove.ariaLabel - {"name":"${evaluations[0].name}"}`,
    });

    expect(removeButton).toBeDisabled();
  });

  it("should add evaluations to compare", async () => {
    const user = userEvent.setup();

    const evaluations = [
      createEvaluationSummary("e1"),
      createEvaluationSummary("e2"),
    ];

    mockEvaluationFetch(evaluations);

    const page = await createPage(
      evaluations.map((evaluation) => evaluation.id),
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(
      evaluationComparePage(evaluations.map((evaluation) => evaluation.id)),
    );

    await user.click(
      screen.getByRole("button", { name: "EvaluationComparePage.action.add" }),
    );

    const selectionDialog = await screen.findByLabelText(
      "EvaluationSelectionPopover.dialog.ariaLabel",
    );

    expect(selectionDialog).toBeInTheDocument();

    const withinSelectionDialog = within(selectionDialog);

    const searchInput = withinSelectionDialog.getByRole("textbox", {
      name: "EvaluationQueryForm.query.placeholder",
    });

    vi.mocked(evaluationsGetAll).mockResolvedValue(
      successfulServiceResponse([
        createGetAllResult("e3"),
        createGetAllResult("e4", EvaluationStatus.FAILURE),
        createGetAllResult("e5"),
      ]),
    );

    const fromDate = parseAbsoluteToLocal("2025-01-04T10:13:14.000Z");
    const toDate = parseAbsoluteToLocal("2025-11-12T13:12:13.999Z");

    await setDatePickerValue(user, "EvaluationQueryForm.from.label", fromDate);
    await setDatePickerValue(user, "EvaluationQueryForm.to.label", toDate);

    await user.click(searchInput);
    await user.keyboard("some query{Enter}");

    expect(evaluationsGetAll).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          query: "some query",
          from_date: fromDate.toAbsoluteString(),
          to_date: toDate.toAbsoluteString(),
          offset: 0,
          limit: 50,
        },
      }),
    );

    const withinTable = within(
      await withinSelectionDialog.findByRole("grid", {
        name: "EvaluationResultsTable.ariaLabel",
      }),
    );

    const evaluationRows = (await withinTable.findAllByRole("row")).slice(1);

    expect(evaluationRows[1]).toHaveAttribute("data-disabled", "true");

    await user.click(evaluationRows[0]);
    await user.click(evaluationRows[2]);

    await user.click(
      withinSelectionDialog.getByRole("button", {
        name: "EvaluationSelectionPopoverContent.add",
      }),
    );

    expect(mockRouter.push).toHaveBeenCalledWith(
      evaluationComparePage(["e1", "e2", "e3", "e5"]).href,
    );
  });

  const createPage = (evaluationIds?: string[]) =>
    Page({
      searchParams: Promise.resolve({
        e:
          (evaluationIds?.length ?? 0) > 1 ? evaluationIds : evaluationIds?.[0],
      }),
    });

  const mockEvaluationFetch = (evaluations: EvaluationDetailSummary[]) => {
    vi.mocked(evaluationsGetEvaluationDetailSummary).mockImplementation(
      (options) => {
        const evaluation = evaluations.find(
          (evaluation) => evaluation.id === options.path.evaluation_id,
        );

        return Promise.resolve(successfulServiceResponse(evaluation!));
      },
    );
  };

  const createEvaluationSummary = (
    id: string,
    status = EvaluationStatus.SUCCESS,
  ): EvaluationDetailSummary => ({
    id,
    createdAt: "2021-01-01T00:00:00.000Z",
    name: `Evaluation ${id}`,
    qaCatalog: {
      id: "1",
      name: "Catalog 1",
      qaPairCount: 10,
    },
    metrics: [
      {
        id: "1",
        name: "Metric 1",
        type: "G_EVAL",
      },
      {
        id: "2",
        name: "Metric 2",
        type: "G_EVAL",
      },
    ],
    metricResults: [
      {
        id: "1",
        name: "Metric 1",
        type: "G_EVAL",
        total: 10,
        successes: 5,
        failures: 3,
        errors: 2,
      },
      {
        id: "2",
        name: "Metric 2",
        type: "G_EVAL",
        total: 10,
        successes: 5,
        failures: 3,
        errors: 2,
      },
    ],
    metricScores: [
      {
        id: "1",
        name: "Metric 1",
        type: "G_EVAL",
        scores: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => ({
          score: score / 10,
          testCaseId: `tc_${score}`,
        })),
      },
      {
        id: "2",
        name: "Metric 2",
        type: "G_EVAL",
        scores: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => ({
          score: score / 10,
          testCaseId: `tc_${score}`,
        })),
      },
    ],
    testCaseProgress: { total: 10, done: 10 },
    status,
    version: 1,
  });

  const createGetAllResult = (
    id: string,
    status = EvaluationStatus.SUCCESS,
  ): GetAllEvaluationResult => ({
    id,
    name: `Evaluation ${id}`,
    createdAt: "2021-01-01T00:00:00.000Z",
    catalog: {
      id: "1",
      name: "Catalog 1",
    },
    metricResults: [],
    testCaseProgress: { total: 10, done: 10 },
    status,
    version: 1,
  });
});
