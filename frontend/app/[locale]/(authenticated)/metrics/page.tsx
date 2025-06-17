import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { MetricsPage } from "@/app/[locale]/(authenticated)/metrics/components/metrics-page";
import { metricsQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
} from "@/app/utils/react-query/server";

import { metricsPage } from "./page-info";

export const generateMetadata = pageMetadata(metricsPage);

export default async function Metrics() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchInfiniteQuery(
    serverInfiniteQueryOptions(metricsQueryDefinition()),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MetricsPage />
    </HydrationBoundary>
  );
}
