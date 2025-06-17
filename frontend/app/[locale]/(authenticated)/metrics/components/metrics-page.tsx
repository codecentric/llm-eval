"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MdAdd } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { EvaluationMetricsTable } from "@/app/[locale]/(authenticated)/metrics/components/evaluation-metrics-table";
import { newMetricPage } from "@/app/[locale]/(authenticated)/metrics/new/page-info";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import { metricsQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientInfiniteQueryOptions } from "@/app/utils/react-query/client";

export const MetricsPage = () => {
  const t = useTranslations();

  const {
    data: metricsData,
    error: metricsError,
    hasNextPage: metricsHasNextPage,
    fetchNextPage: metricsFetchNextPage,
  } = useInfiniteQuery(clientInfiniteQueryOptions(metricsQueryDefinition()));

  return (
    <PageContent
      pageInfo={metricsPage}
      actions={[
        <PageAction
          key="new"
          icon={MdAdd}
          href={newMetricPage.href}
          text={t("MetricsPage.new")}
          asLink
          inlineText
        />,
      ]}
    >
      <DisplayContentOrError error={metricsError}>
        {metricsData && (
          <EvaluationMetricsTable
            items={metricsData}
            hasMore={metricsHasNextPage}
            loadMore={metricsFetchNextPage}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
