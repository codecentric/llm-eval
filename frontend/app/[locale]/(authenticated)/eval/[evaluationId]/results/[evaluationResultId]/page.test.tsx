import "@/app/test-utils/mock-intl";

import { render, screen, within } from "@testing-library/react";

import {
  evaluationResultsGet,
  evaluationsGet,
  EvaluationStatus,
  LlmEvalEvalEvaluateResultsRouterEvaluationResult,
  LlmEvalEvalEvaluationsModelsEvaluationResult,
  TestCaseStatus,
} from "@/app/client";
import { expectValue } from "@/app/test-utils/details-page";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import Page from "./page";

vi.mock("@/app/client");

describe("Evaluation Result Page", () => {
  const fullTestCase: LlmEvalEvalEvaluateResultsRouterEvaluationResult = {
    id: "tc1",
    actualOutput: "actual",
    expectedOutput: "expected",
    status: TestCaseStatus.SUCCESS,
    configurationId: "configId1",
    configurationName: "configName1",
    configurationVersion: "configVersion1",
    context: ["context"],
    input: "input",
    metaData: {},
    metricsData: [
      {
        id: "m1",
        name: "metric1",
        score: 0.5,
        error: null,
        evaluationModel: "evalModel1",
        reason: "reason1",
        success: true,
        threshold: 0.3,
        strictMode: true,
      },
      {
        id: "m2",
        name: "metric2",
        score: 0.6,
        error: "",
        evaluationModel: "",
        reason: "",
        success: false,
        threshold: 0.7,
        strictMode: false,
      },
      {
        id: "m3",
        name: "metric3",
        score: null,
        error: "error3",
        evaluationModel: null,
        reason: null,
        success: false,
        threshold: 0.7,
        strictMode: false,
      },
    ],
    retrievalContext: ["retrievalContext"],
    error: null,
  };

  const minimalTestCase: LlmEvalEvalEvaluateResultsRouterEvaluationResult = {
    id: "tc1",
    expectedOutput: "expected",
    actualOutput: null,
    status: TestCaseStatus.PENDING,
    configurationId: null,
    configurationName: null,
    configurationVersion: null,
    context: null,
    input: "input",
    metaData: null,
    metricsData: [],
    retrievalContext: null,
    error: null,
  };

  const emptyTestCase: LlmEvalEvalEvaluateResultsRouterEvaluationResult = {
    id: "tc1",
    expectedOutput: "expected",
    actualOutput: "",
    status: TestCaseStatus.PENDING,
    configurationId: null,
    configurationName: null,
    configurationVersion: null,
    context: [],
    input: "input",
    metaData: {},
    metricsData: [],
    retrievalContext: [],
    error: null,
  };

  const evaluation: LlmEvalEvalEvaluationsModelsEvaluationResult = {
    id: "eval1",
    name: "evaluation",
    createdAt: "2021-01-01T00:00:00Z",
    status: EvaluationStatus.SUCCESS,
    version: 0,
  };

  it.each([
    { name: "full", testCase: fullTestCase },
    { name: "minimal", testCase: minimalTestCase },
    { name: "empty", testCase: emptyTestCase },
  ])("should render the test case $name", async ({ testCase }) => {
    mockApi(testCase);

    const page = await createPage(evaluation.id, testCase.id);

    render(page, { wrapper: createPageWrapper() });

    await expectTestCase(testCase);
  });

  it.each(Object.values(TestCaseStatus))(
    "should render the correct status icon for status %s",
    async (status) => {
      const testCase = { ...fullTestCase, status };

      mockApi(testCase);

      const page = await createPage(evaluation.id, testCase.id);

      render(page, { wrapper: createPageWrapper() });

      const statusChip = await screen.findByTestId("status-chip");

      expect(statusChip).toHaveTextContent(`testCaseStatus.${status}`);
    },
  );

  it("should render the error message", async () => {
    const testCase = { ...fullTestCase, error: "error" };

    mockApi(testCase);

    const page = await createPage(evaluation.id, testCase.id);

    render(page, { wrapper: createPageWrapper() });

    const errorDisplay = await screen.findByTestId("error-display");

    expect(errorDisplay).toHaveTextContent(
      "EvaluationResultDetails.errorTitle",
    );
    expect(errorDisplay).toHaveTextContent(testCase.error);
  });

  const expectTestCase = async (
    testCase: LlmEvalEvalEvaluateResultsRouterEvaluationResult,
  ) => {
    await expectValue("EvaluationResultDetails.input", testCase.input);
    await expectValue(
      "EvaluationResultDetails.expectedOutput",
      testCase.expectedOutput,
    );
    await expectValue(
      "EvaluationResultDetails.actualOutput",
      testCase.actualOutput || "-",
    );
    if (testCase.context?.length) {
      for (const context of testCase.context) {
        await expectValue("EvaluationResultDetails.context", context);
      }
    } else {
      await expectValue("EvaluationResultDetails.context", "-");
    }
    if (testCase.retrievalContext?.length) {
      for (const retrievalContext of testCase.retrievalContext) {
        await expectValue(
          "EvaluationResultDetails.retrievalContext",
          retrievalContext,
        );
      }
    } else {
      await expectValue("EvaluationResultDetails.retrievalContext", "-");
    }

    const rows = screen.getAllByRole("row");

    for (const [index, metric] of testCase.metricsData.entries()) {
      const row = rows[index + 1];

      const cells = within(row).getAllByRole("gridcell");

      expect(within(row).getByRole("rowheader")).toHaveTextContent(metric.name);
      expect(
        within(cells[0]).getByTestId(
          metric.success ? "success-icon" : "failure-icon",
        ),
      ).toBeInTheDocument();
      expect(cells[1]).toHaveTextContent(metric.score?.toString() ?? "");
      expect(cells[2]).toHaveTextContent(metric.threshold?.toString() ?? "");
      expect(cells[3]).toHaveTextContent(metric.reason ?? "");
      expect(cells[4]).toHaveTextContent(metric.evaluationModel ?? "");
      expect(cells[5]).toHaveTextContent(metric.strictMode ? "true" : "false");
      expect(cells[6]).toHaveTextContent(metric.error ?? "");
    }
  };

  const mockApi = (
    testCase: LlmEvalEvalEvaluateResultsRouterEvaluationResult,
  ) => {
    vi.mocked(evaluationsGet).mockResolvedValue(
      successfulServiceResponse(evaluation),
    );
    vi.mocked(evaluationResultsGet).mockResolvedValue(
      successfulServiceResponse(testCase),
    );
  };

  const createPage = (evaluationId: string, evaluationResultId: string) =>
    Page({
      params: Promise.resolve({ evaluationId, evaluationResultId }),
    });
});
