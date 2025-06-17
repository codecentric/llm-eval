import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StatusCodes } from "http-status-codes";

import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import {
  EvaluationDetailSummary,
  evaluationResultsGetGrouped,
  evaluationsDelete,
  evaluationsGetEvaluationDetailSummary,
  EvaluationStatus,
  GroupedEvaluationResult,
  TestCaseStatus,
} from "@/app/client";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { waitForPageRender } from "@/app/test-utils/wait-for-page";
import { EditOrigin } from "@/app/types/edit-origin";
import {
  HttpError,
  ValidationError,
} from "@/app/utils/backend-client/exception-handler";

import { downloadEvaluationResults } from "./download";
import { evaluationEditPage } from "./edit/page-info";
import Page from "./page";
import { evaluationPage } from "./page-info";
import { executionEvaluationResultPage } from "./results/[evaluationResultId]/page-info";
import { EvaluationDetailsTab } from "./types";

vi.mock("@/app/client");
vi.mock("@/app/[locale]/(authenticated)/eval/[evaluationId]/download");

describe("Evaluation Details Page", () => {
  it("should render evaluation details summary", async () => {
    const evaluationSummary = createEvaluationSummary();
    const groupedTestCases = [
      createGroupedEvaluationResult("1"),
      createGroupedEvaluationResult("2"),
    ];

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse(groupedTestCases),
    );

    const page = await createPage(evaluationSummary.id);

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);

    await expectOverview(evaluationSummary);
  });

  it("should render evaluation test cases", async () => {
    const evaluationSummary = createEvaluationSummary();
    const groupedTestCases = [
      createGroupedEvaluationResult("1"),
      createGroupedEvaluationResult("2"),
    ];

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse(groupedTestCases),
    );

    const page = await createPage(
      evaluationSummary.id,
      EvaluationDetailsTab.RESULTS,
    );

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);
    await expectGroupedTestCases(evaluationSummary.id, groupedTestCases);
  });

  it("should go to edit page on button click", async () => {
    const evaluationSummary = createEvaluationSummary();

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse([]),
    );

    const page = await createPage(evaluationSummary.id);

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);

    const editButton = screen.getByRole("button", {
      name: "EvaluationDetailsPage.edit",
    });

    expect(editButton).toHaveAttribute(
      "href",
      evaluationEditPage({
        evaluationId: evaluationSummary.id,
        origin: EditOrigin.DETAILS,
      }).href,
    );
  });

  it("should download results on button click", async () => {
    const user = userEvent.setup();

    const evaluationSummary = createEvaluationSummary();

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse([]),
    );

    const page = await createPage(evaluationSummary.id);

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);

    const downloadButton = screen.getByRole("button", {
      name: "EvaluationDetailsPage.downloadResults",
    });

    await user.click(downloadButton);

    await waitFor(() => {
      expect(downloadEvaluationResults).toHaveBeenCalledWith(
        evaluationSummary.id,
        {
          onStart: expect.any(Function),
          onFinish: expect.any(Function),
        },
      );
    });
  });

  it("should navigate to compare page on button click", async () => {
    const evaluationSummary = createEvaluationSummary();

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse([]),
    );

    const page = await createPage(evaluationSummary.id);

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);

    const compareButton = screen.getByRole("button", {
      name: "EvaluationDetailsPage.compare",
    });

    expect(compareButton).toHaveAttribute(
      "href",
      evaluationComparePage([evaluationSummary.id]).href,
    );
  });

  it("should delete evaluation on button click", async () => {
    const user = userEvent.setup();

    const evaluationSummary = createEvaluationSummary();

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockResolvedValue(
      successfulServiceResponse(evaluationSummary),
    );
    vi.mocked(evaluationResultsGetGrouped).mockResolvedValue(
      successfulServiceResponse([]),
    );
    vi.mocked(evaluationsDelete).mockResolvedValue(
      successfulServiceResponse(undefined),
    );

    const page = await createPage(evaluationSummary.id);

    render(page, { wrapper: createPageWrapper() });

    await waitForRender(evaluationSummary);

    const deleteButton = screen.getByRole("button", {
      name: "DetailsPage.delete",
    });

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useEvaluationDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(evaluationsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: evaluationSummary.version },
          path: {
            evaluation_id: evaluationSummary.id,
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

  it("should show errors and disabled buttons if loading page data failed", async () => {
    const evaluationId = "1";

    vi.mocked(evaluationsGetEvaluationDetailSummary).mockRejectedValue({
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      error: { detail: [] },
    } satisfies ValidationError);
    vi.mocked(evaluationResultsGetGrouped).mockRejectedValue({
      status: StatusCodes.BAD_REQUEST,
      error: { detail: "Error" },
    } satisfies HttpError);

    const page = await createPage(evaluationId);

    render(page, { wrapper: createPageWrapper() });

    expect(
      (await screen.findAllByText("page.genericDataLoadError")).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", {
        name: "EvaluationDetailsPage.edit",
      }),
    ).toHaveAttribute("data-disabled", "true");
    expect(
      screen.getByRole("button", {
        name: "EvaluationDetailsPage.downloadResults",
      }),
    ).toHaveAttribute("data-disabled", "true");
    expect(
      screen.getByRole("button", {
        name: "DetailsPage.delete",
      }),
    ).toHaveAttribute("data-disabled", "true");
  });

  const waitForRender = async (evaluationSummary: EvaluationDetailSummary) => {
    const pageInfo = evaluationPage({
      evaluationId: evaluationSummary.id,
      name: evaluationSummary.name,
    });

    await waitForPageRender(pageInfo);
  };

  const expectOverview = async (evaluationSummary: EvaluationDetailSummary) => {
    await expectLabeledValue(
      "EvaluationDetailSummary.generalInformation.createdAt",
      (parent) => {
        expect(
          within(parent).getByText(evaluationSummary.createdAt),
        ).toBeInTheDocument();
      },
    );
    await expectLabeledValue(
      "EvaluationDetailSummary.generalInformation.qaCatalog",
      (parent) => {
        const link = within(parent).getByRole("link");

        expect(link).toHaveTextContent(evaluationSummary.qaCatalog!.name);
        expect(link).toHaveAttribute(
          "href",
          qaCatalogDetailPage(evaluationSummary.qaCatalog!.id).href,
        );
      },
    );
    await expectLabeledValue(
      "EvaluationDetailSummary.generalInformation.qaPairCount",
      (parent) => {
        expect(
          within(parent).getByText(
            evaluationSummary.qaCatalog!.qaPairCount!.toString(),
          ),
        ).toBeInTheDocument();
      },
    );

    for (const metricResult of evaluationSummary.metricResults) {
      const panelTitleElement = screen.getByText(
        "EvaluationDetailSummary.metricResults.title",
      );

      // eslint-disable-next-line testing-library/no-node-access
      const panelElement = panelTitleElement.parentElement!.parentElement!;

      expect(
        within(panelElement).getByText(metricResult.name.toString()),
      ).toBeInTheDocument();
    }
  };

  const expectGroupedTestCases = async (
    evaluationId: string,
    groupedTestCases: GroupedEvaluationResult[],
  ) => {
    const headRowOffset = 1;
    const groupedTestCaseRowCount = 2;

    const testCaseRows = screen.getAllByRole("row");

    const rowCount = groupedTestCases.reduce(
      (count, testCase) =>
        count +
        groupedTestCaseRowCount +
        testCase.testCases.length +
        headRowOffset,
      headRowOffset,
    );

    expect(testCaseRows).toHaveLength(rowCount);

    for (const [index, groupedTestCase] of groupedTestCases.entries()) {
      const testCaseRowCount =
        groupedTestCaseRowCount +
        groupedTestCase.testCases.length +
        headRowOffset;
      const groupedTestCaseRowOffset = headRowOffset + index * testCaseRowCount;

      const groupedTestCaseRow = testCaseRows[groupedTestCaseRowOffset];

      expect(
        within(groupedTestCaseRow).getByText(
          groupedTestCase.configurationName!,
        ),
      ).toBeInTheDocument();
      expect(
        within(groupedTestCaseRow).getByText(
          groupedTestCase.configurationVersion!,
        ),
      ).toBeInTheDocument();
      expect(
        within(groupedTestCaseRow).getByText(groupedTestCase.createdAt),
      ).toBeInTheDocument();
      expect(
        within(groupedTestCaseRow).getByText(groupedTestCase.input),
      ).toBeInTheDocument();
      expect(
        within(groupedTestCaseRow).getByText(groupedTestCase.expectedOutput),
      ).toBeInTheDocument();

      const expandRow = testCaseRows[groupedTestCaseRowOffset + 1];

      groupedTestCase.testCases.forEach((testCase, tcIndex) => {
        const testCaseRow =
          within(expandRow).getAllByRole("row")[headRowOffset + tcIndex];

        const link = within(testCaseRow).getByRole("link", {
          name: `${testCase.index + 1}`,
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
          "href",
          executionEvaluationResultPage(evaluationId, testCase.id).href,
        );

        const detailsButton = within(testCaseRow).getByRole("menuitem", {
          name: "TestCaseGroupDetails.actions.view",
        });
        expect(detailsButton).toBeInTheDocument();
        expect(detailsButton).toHaveAttribute(
          "href",
          executionEvaluationResultPage(evaluationId, testCase.id).href,
        );
      });
    }
  };

  const expectLabeledValue = async (
    label: string,
    expectation: (container: HTMLElement) => Promise<unknown> | unknown,
    // parent: typeof screen | ReturnType<typeof within> = screen,
  ) => {
    const labelElement = screen.getByText(label);

    // eslint-disable-next-line testing-library/no-node-access
    const valueElement = labelElement.nextElementSibling as HTMLElement;

    await expectation(valueElement);
  };

  const createPage = (evaluationId: string, tab?: EvaluationDetailsTab) =>
    Page({
      params: Promise.resolve({ evaluationId }),
      searchParams: Promise.resolve({ tab }),
    });

  const createEvaluationSummary = (
    status = EvaluationStatus.SUCCESS,
  ): EvaluationDetailSummary => ({
    id: "1",
    createdAt: "2021-01-01T00:00:00.000Z",
    name: "Evaluation 1",
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

  const createGroupedEvaluationResult = (
    id: string,
  ): GroupedEvaluationResult => ({
    groupingKey: id,
    configurationId: `CFG${id}`,
    configurationName: `Configuration ${id}`,
    configurationVersion: `V${id}`,
    createdAt: "2021-01-01T00:00:00.000Z",
    expectedOutput: `Expected Output ${id}`,
    input: `Input ${id}`,
    metaData: {},
    metricResults: [
      {
        id: "1",
        name: "Metric 1",
        type: "G_EVAL",
        total: 2,
        successes: 1,
        failures: 0,
        errors: 1,
      },
      {
        id: "2",
        name: "Metric 2",
        type: "G_EVAL",
        total: 2,
        successes: 0,
        failures: 1,
        errors: 1,
      },
    ],
    testCases: [
      {
        id: `${id}.1`,
        index: 0,
        testCaseStatus: TestCaseStatus.SUCCESS,
        results: [
          {
            metricId: "1",
            success: true,
            score: 0.3,
            threashold: 0.2,
          },
          {
            metricId: "2",
            success: false,
            score: 0.4,
            threashold: 0.5,
          },
        ],
      },
      {
        id: `${id}.2`,
        index: 1,
        testCaseStatus: TestCaseStatus.FAILURE,
        results: [],
      },
    ],
  });
});
