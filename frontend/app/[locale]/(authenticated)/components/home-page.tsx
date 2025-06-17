"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { homePage } from "@/app/[locale]/(authenticated)/page-info";
import { dashboardDataQueryDefinition } from "@/app/[locale]/(authenticated)/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

import { DashboardLastEvaluationCard } from "./dashboard-last-evaluation-card";
import { DashboardStatisticsCard } from "./dashboard-statistics-card";

export type HomePageProps = {
  contextHelp: React.ReactElement;
};

export const HomePage: React.FC<HomePageProps> = ({ contextHelp }) => {
  const { data: dashboardData, error: dashboardDataError } = useQuery(
    clientQueryOptions(dashboardDataQueryDefinition),
  );

  return (
    <PageContent pageInfo={homePage} helpPage={contextHelp}>
      <DisplayContentOrError error={dashboardDataError}>
        {dashboardData && (
          <div className="flex items-start gap-4">
            <DashboardLastEvaluationCard
              className="flex-1 grow"
              lastEvaluationData={dashboardData.lastEvaluation ?? undefined}
            />
            <DashboardStatisticsCard statistics={dashboardData.statistics} />
          </div>
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
