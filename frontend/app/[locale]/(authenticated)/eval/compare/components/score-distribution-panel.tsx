import { atom, useAtom } from "jotai";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DetailsPanel } from "@/app/[locale]/(authenticated)/components/details-panel";
import { IntervalSlider } from "@/app/[locale]/(authenticated)/eval/components/interval-slider";
import { MetricScoresBarChart } from "@/app/[locale]/(authenticated)/eval/components/metric-scores-bar-chart";
import { EvaluationDetailSummary } from "@/app/client";

export const scoreDistributionIntervalAtom = atom(0.1);

export type ScoreDistributionPanelProps = {
  evaluation: EvaluationDetailSummary;
};

export const ScoreDistributionPanel: React.FC<ScoreDistributionPanelProps> = ({
  evaluation,
}) => {
  const t = useTranslations();
  const [interval, setInterval] = useAtom(scoreDistributionIntervalAtom);
  const [intervalDisabled, setIntervalDisabled] = useState(true);

  return (
    <DetailsPanel
      title={t("ScoreDistributionPanel.distribution.title")}
      titleEnd={
        <IntervalSlider
          className="w-full"
          isDisabled={intervalDisabled}
          value={interval}
          onChange={setInterval}
          dense
        />
      }
    >
      <MetricScoresBarChart
        metricScores={evaluation.metricScores}
        interval={interval}
        onReady={() => {
          setIntervalDisabled(false);
        }}
      />
    </DetailsPanel>
  );
};
