import { useTranslations } from "next-intl";
import React from "react";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { MetricResultsBox } from "@/app/[locale]/(authenticated)/eval/components/metric-results-box";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { NameValueGrid } from "@/app/[locale]/components/name-value-grid";
import { useCollectMetricResultsHistoryData } from "@/app/[locale]/hooks/use-collect-metric-results-history-data";
import { DashboardLastEvaluationResult } from "@/app/client";
import { NavigationLink } from "@/app/components/navigation-link";

import { DetailsPanel } from "./details-panel";
import { MetricHistoryChart } from "./metric-history-chart";

export type DashboardLastEvaluationCardProps = {
  className?: string;
  lastEvaluationData?: DashboardLastEvaluationResult;
};

export const DashboardLastEvaluationCard: React.FC<
  DashboardLastEvaluationCardProps
> = ({ className, lastEvaluationData }) => {
  const t = useTranslations();

  const catalogHistoryData = useCollectMetricResultsHistoryData(
    lastEvaluationData?.catalogHistory?.evaluationResults,
  );

  return (
    <DetailsPanel
      className={className}
      title={t("DashboardLastEvaluationCard.title")}
    >
      {lastEvaluationData ? (
        <div>
          <NameValueGrid
            className="w-fit"
            items={[
              {
                key: "name",
                name: t("DashboardLastEvaluationCard.category.name"),
                value: (
                  <NavigationLink
                    className="text-[length:inherit]"
                    href={
                      evaluationPage({
                        evaluationId: lastEvaluationData.id,
                      }).href
                    }
                  >
                    {lastEvaluationData.name}
                  </NavigationLink>
                ),
              },
              ...(lastEvaluationData.catalogHistory
                ? [
                    {
                      key: "catalog",
                      name: t("DashboardLastEvaluationCard.category.catalog"),
                      value: (
                        <NavigationLink
                          className="text-[length:inherit]"
                          href={
                            qaCatalogDetailPage(
                              lastEvaluationData.catalogHistory.catalogId,
                            ).href
                          }
                        >
                          {lastEvaluationData.catalogHistory.catalogName}
                        </NavigationLink>
                      ),
                    },
                  ]
                : []),
              {
                key: "metricResults",
                name: t("DashboardLastEvaluationCard.category.scores"),
                value: (
                  <MetricResultsBox
                    metricResults={lastEvaluationData.metricResults}
                  />
                ),
              },
            ]}
          />

          {catalogHistoryData.length ? (
            <div className="mt-4">
              <div className="text-small text-secondary font-bold mb-2">
                {t("DashboardLastEvaluationCard.category.catalogHistory")}
              </div>

              {catalogHistoryData.map((history) => (
                <MetricHistoryChart key={history.metricId} history={history} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        t("DashboardLastEvaluationCard.noEvaluation")
      )}
    </DetailsPanel>
  );
};
