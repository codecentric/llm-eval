import { useTranslations } from "next-intl";
import React from "react";

import {
  DetailsPanel,
  DetailsPanelProps,
} from "@/app/[locale]/(authenticated)/components/details-panel";
import { MetricScoresBoxPlotChart } from "@/app/[locale]/(authenticated)/eval/components/metric-scores-box-plot-chart";
import { MetricScores } from "@/app/client";

export type ScoreBoxPlotPanelProps = {
  panelVariant?: DetailsPanelProps["variant"];
  metricScores: MetricScores[];
};

export const ScoreBoxPlotPanel: React.FC<ScoreBoxPlotPanelProps> = ({
  metricScores,
  panelVariant,
}) => {
  const t = useTranslations();

  return (
    <DetailsPanel
      variant={panelVariant}
      title={t("ScoreBoxPlotPanel.boxPlot.title")}
    >
      <MetricScoresBoxPlotChart className="mt-2" metricScores={metricScores} />
    </DetailsPanel>
  );
};
