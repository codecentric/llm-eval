import { useTranslations } from "next-intl";

import { DetailsPanel } from "@/app/[locale]/(authenticated)/components/details-panel";
import { MetricScoresBoxPlotChart } from "@/app/[locale]/(authenticated)/eval/components/metric-scores-box-plot-chart";
import { EvaluationDetailSummary } from "@/app/client";

export type ScoreBoxPlotPanelProps = {
  evaluation: EvaluationDetailSummary;
};

export const ScoreBoxPlotPanel: React.FC<ScoreBoxPlotPanelProps> = ({
  evaluation,
}) => {
  const t = useTranslations();

  return (
    <DetailsPanel title={t("ScoreBoxPlotPanel.boxPlot.title")}>
      <MetricScoresBoxPlotChart
        className="mt-2"
        metricScores={evaluation.metricScores}
      />
    </DetailsPanel>
  );
};
