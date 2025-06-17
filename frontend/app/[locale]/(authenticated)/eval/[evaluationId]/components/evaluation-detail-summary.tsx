"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { DetailsPanel } from "@/app/[locale]/(authenticated)/components/details-panel";
import { EvaluationGeneralInformation } from "@/app/[locale]/(authenticated)/eval/components/evaluation-general-information";
import { MetricResultChart } from "@/app/[locale]/(authenticated)/eval/components/metric-result-chart";
import { EvaluationDetailSummary as EvaluationDetailSummaryDto } from "@/app/client";

import { MetricScoreCharts } from "./metric-score-charts";

export type EvaluationResultSummaryProps = {
  evaluationDetailSummary: EvaluationDetailSummaryDto;
};

export const EvaluationDetailSummary = ({
  evaluationDetailSummary,
}: EvaluationResultSummaryProps) => {
  const t = useTranslations();

  const sortedMetricResults = useMemo(
    () =>
      [...evaluationDetailSummary.metricResults].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [evaluationDetailSummary.metricResults],
  );

  const panelVariant = "card";

  return (
    <div className="flex flex-col gap-4">
      <DetailsPanel
        variant={panelVariant}
        title={t("EvaluationDetailSummary.generalInformation.title")}
      >
        <EvaluationGeneralInformation evaluation={evaluationDetailSummary} />
      </DetailsPanel>

      <DetailsPanel
        variant={panelVariant}
        title={t("EvaluationDetailSummary.metricResults.title")}
      >
        <div className="flex gap-4 flex-wrap">
          {sortedMetricResults.map((metricResult) => (
            <div key={metricResult.id}>
              <MetricResultChart
                metricResult={metricResult}
                title={metricResult.name}
              />
            </div>
          ))}
        </div>
      </DetailsPanel>

      <MetricScoreCharts
        panelVariant={panelVariant}
        metricScores={evaluationDetailSummary.metricScores}
      />
    </div>
  );
};
