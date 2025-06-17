import React, { useMemo } from "react";

import { DetailsPanelProps } from "@/app/[locale]/(authenticated)/components/details-panel";
import { MetricScores } from "@/app/client";

import { ScoreBoxPlotPanel } from "./score-box-plot-panel";
import { ScoreDistributionPanel } from "./score-distribution-panel";

export type MetricScoreChartsProps = {
  metricScores: MetricScores[];
  className?: string;
  panelVariant?: DetailsPanelProps["variant"];
};

export const MetricScoreCharts: React.FC<MetricScoreChartsProps> = ({
  metricScores,
  panelVariant,
}) => {
  const sortedScores = useMemo(
    () => metricScores.sort((a, b) => a.name.localeCompare(b.name)),
    [metricScores],
  );

  return (
    <>
      <ScoreDistributionPanel
        panelVariant={panelVariant}
        metricScores={sortedScores}
      />
      <ScoreBoxPlotPanel
        panelVariant={panelVariant}
        metricScores={sortedScores}
      />
    </>
  );
};
