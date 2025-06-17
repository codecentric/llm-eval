"use client";

import { addToast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { DetailsPage } from "@/app/[locale]/(authenticated)/components/details-page";
import { MetricDetails } from "@/app/[locale]/(authenticated)/metrics/[metricId]/components/metric-details";
import { metricEditPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/edit/page-info";
import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { useMetricDelete } from "@/app/[locale]/(authenticated)/metrics/hooks/use-metric-delete";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import { metricQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { usePageData } from "@/app/[locale]/hooks/use-page-data";
import { Metric } from "@/app/client";
import { clientQueryOptions } from "@/app/utils/react-query/client";
import { useRouter } from "@/i18n/routing";

export type MetricDetailsPageProps = {
  metricId: string;
};

export const MetricDetailsPage = ({ metricId }: MetricDetailsPageProps) => {
  const router = useRouter();

  const { data: metricData, error: metricError } = useQuery(
    clientQueryOptions(metricQueryDefinition(metricId)),
  );

  const { delete: deleteMetric } = useMetricDelete({
    onSuccess: ({ message }) => {
      router.replace(metricsPage.href);
      addToast({ title: message, color: "success" });
    },
  });

  const pageData = usePageData(metricData, metricError);

  const content = useCallback(
    (metric: Metric) => <MetricDetails metric={metric} />,
    [],
  );

  return (
    <DetailsPage
      pageInfo={metricDetailsPage(metricId, metricData?.configuration.name)}
      pageData={pageData}
      onDelete={(metric) => deleteMetric(metric)}
      onEdit={metricEditPage({ metricId }).href}
    >
      {content}
    </DetailsPage>
  );
};
