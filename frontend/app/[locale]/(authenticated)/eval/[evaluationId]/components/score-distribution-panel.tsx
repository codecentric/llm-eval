import { useTranslations } from "next-intl";
import React, { useState } from "react";

import {
  DetailsPanel,
  DetailsPanelProps,
} from "@/app/[locale]/(authenticated)/components/details-panel";
import { IntervalSlider } from "@/app/[locale]/(authenticated)/eval/components/interval-slider";
import { MetricScoresBarChart } from "@/app/[locale]/(authenticated)/eval/components/metric-scores-bar-chart";
import { MetricScores } from "@/app/client";

export type ScoreDistributionPanelProps = {
  panelVariant?: DetailsPanelProps["variant"];
  metricScores: MetricScores[];
};

export const ScoreDistributionPanel: React.FC<ScoreDistributionPanelProps> = ({
  panelVariant,
  metricScores,
}) => {
  const t = useTranslations();

  const [interval, setInterval] = useState(0.1);
  const [intervalDisabled, setIntervalDisabled] = useState(true);

  return (
    <DetailsPanel
      variant={panelVariant}
      title={t("ScoreDistributionPanel.distribution.title")}
      titleEnd={
        <IntervalSlider
          value={interval}
          onChange={setInterval}
          isDisabled={intervalDisabled}
        />
      }
    >
      <MetricScoresBarChart
        metricScores={metricScores}
        interval={interval}
        onReady={() => {
          setIntervalDisabled(false);
        }}
      />
    </DetailsPanel>
  );
};
