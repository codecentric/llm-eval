import { useTranslations } from "next-intl";

import { DetailsPanel } from "@/app/[locale]/(authenticated)/components/details-panel";
import { MetricHistoryChart } from "@/app/[locale]/(authenticated)/components/metric-history-chart";
import { useCollectMetricResultsHistoryData } from "@/app/[locale]/hooks/use-collect-metric-results-history-data";
import { EvaluationDetailSummary } from "@/app/client";

export type MetricResultsPanelProps = {
  evaluations: EvaluationDetailSummary[];
};

export const MetricResultsPanel: React.FC<MetricResultsPanelProps> = ({
  evaluations,
}) => {
  const t = useTranslations();

  const catalogHistoryData = useCollectMetricResultsHistoryData(evaluations);

  return (
    <DetailsPanel
      style={{ gridColumn: `span ${evaluations.length}` }}
      title={t("MetricResultsPanel.title")}
    >
      {catalogHistoryData.map((history) => (
        <MetricHistoryChart key={history.metricId} history={history} />
      ))}
    </DetailsPanel>
  );
};
