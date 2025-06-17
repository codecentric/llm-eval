import { renderHook } from "@testing-library/react";

import {
  MetricResultHistory,
  Results,
  useCollectMetricResultsHistoryData,
} from "./use-collect-metric-results-history-data";

describe("useCollectMetricResultsHistoryData", () => {
  it("should collect history data", () => {
    const results: Results[] = [
      {
        id: "1",
        name: "Evaluation 1",
        metricResults: [
          {
            id: "metric1",
            name: "Metric 1",
            successes: 10,
            failures: 2,
            errors: 1,
            total: 13,
            type: "G_EVAL",
          },
          {
            id: "metric2",
            name: "Metric 2",
            successes: 10,
            failures: 2,
            errors: 1,
            total: 13,
            type: "G_EVAL",
          },
        ],
      },
      {
        id: "2",
        name: "Evaluation 2",
        metricResults: [
          {
            id: "metric3",
            name: "Metric 3",
            successes: 10,
            failures: 2,
            errors: 1,
            total: 13,
            type: "G_EVAL",
          },
          {
            id: "metric2",
            name: "Metric 2",
            successes: 10,
            failures: 2,
            errors: 1,
            total: 13,
            type: "G_EVAL",
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useCollectMetricResultsHistoryData(results),
    );

    expect(result.current).toEqual([
      {
        metricId: "metric1",
        metricName: "Metric 1",
        data: [
          {
            evaluationId: "1",
            evaluationName: "Evaluation 1",
            successes: 10,
            failures: 2,
            errors: 1,
          },
          {
            evaluationId: "2",
            evaluationName: "Evaluation 2",
            successes: 0,
            failures: 0,
            errors: 0,
          },
        ],
      },
      {
        metricId: "metric2",
        metricName: "Metric 2",
        data: [
          {
            evaluationId: "1",
            evaluationName: "Evaluation 1",
            successes: 10,
            failures: 2,
            errors: 1,
          },
          {
            evaluationId: "2",
            evaluationName: "Evaluation 2",
            successes: 10,
            failures: 2,
            errors: 1,
          },
        ],
      },
      {
        metricId: "metric3",
        metricName: "Metric 3",
        data: [
          {
            evaluationId: "1",
            evaluationName: "Evaluation 1",
            successes: 0,
            failures: 0,
            errors: 0,
          },
          {
            evaluationId: "2",
            evaluationName: "Evaluation 2",
            successes: 10,
            failures: 2,
            errors: 1,
          },
        ],
      },
    ] satisfies MetricResultHistory[]);
  });

  it("should return empty history if no results are provided", () => {
    const { result } = renderHook(() =>
      useCollectMetricResultsHistoryData(undefined),
    );

    expect(result.current).toEqual([]);
  });
});
