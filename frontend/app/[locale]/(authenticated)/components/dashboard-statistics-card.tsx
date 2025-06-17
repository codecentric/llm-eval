import { useTranslations } from "next-intl";

import { DashboardStatistics } from "@/app/client";

import { DetailsPanel } from "./details-panel";

export type DashboardStatisticsCardProps = {
  statistics: DashboardStatistics;
  className?: string;
};

export const DashboardStatisticsCard: React.FC<
  DashboardStatisticsCardProps
> = ({ className, statistics }) => {
  const t = useTranslations();

  return (
    <DetailsPanel
      title={t("DashboardStatisticsCard.title")}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4 min-w-96">
        <div
          className="p-4 border-1 border-divider rounded-medium"
          role="region"
          aria-label={t("DashboardStatisticsCard.catalogs")}
        >
          <p className="text-sm text-secondary">
            {t("DashboardStatisticsCard.catalogs")}
          </p>
          <p className="text-2xl font-bold">{statistics.numberOfCatalogs}</p>
        </div>
        <div
          className="p-4 border-1 border-divider rounded-medium"
          role="region"
          aria-label={t("DashboardStatisticsCard.evaluations")}
        >
          <p className="text-sm text-secondary">
            {t("DashboardStatisticsCard.evaluations")}
          </p>
          <p className="text-2xl font-bold">{statistics.numberOfEvaluations}</p>
        </div>
      </div>
    </DetailsPanel>
  );
};
