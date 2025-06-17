import { useMemo } from "react";

import {
  DashboardEvaluationResult,
  EvaluationDetailSummary,
} from "@/app/client";

export type MetricResultHitoryDataPoint = {
  evaluationId: string;
  evaluationName: string;
  successes: number;
  failures: number;
  errors: number;
};

export type MetricResultHistory = {
  metricId: string;
  metricName: string;
  data: MetricResultHitoryDataPoint[];
};

export type Results = Pick<
  DashboardEvaluationResult | EvaluationDetailSummary,
  "metricResults" | "id" | "name"
>;

export const useCollectMetricResultsHistoryData = (
  results: Results[] | undefined,
) => {
  const metrics = useMemo(
    () =>
      results
        ?.map((result) => result.metricResults)
        .flat()
        .reduce<Record<string, string>>(
          (acc, metricResult) => ({
            ...acc,
            [metricResult.id]: metricResult.name,
          }),
          {},
        ) ?? {},
    [results],
  );

  const history = useMemo(
    () =>
      Object.entries(metrics)
        .map<MetricResultHistory>(([metricId, metricName]) => ({
          metricId,
          metricName,
          data: (results ?? []).map<MetricResultHitoryDataPoint>((result) => {
            const metricResult = result.metricResults.find(
              (mr) => mr.id === metricId,
            );

            return {
              evaluationId: result.id,
              evaluationName: result.name,
              successes: metricResult?.successes ?? 0,
              failures: metricResult?.failures ?? 0,
              errors: metricResult?.errors ?? 0,
            };
          }),
        }))
        .sort((a, b) => a.metricName.localeCompare(b.metricName)),
    [metrics, results],
  );

  return history;
};
