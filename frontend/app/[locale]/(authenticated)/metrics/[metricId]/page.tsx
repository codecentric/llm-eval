import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { MetricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/components/metric-details-page";
import { metricQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { metricDetailsPage } from "./page-info";

type Props = PropsWithParams<{ metricId: string }>;

export const generateMetadata = pageMetadata(
  metricDetailsPage,
  async ({ params }: Props) => {
    const { metricId } = await params;

    return [metricId] as const;
  },
);

export default async function MetricDetails({ params }: Props) {
  const { metricId } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(metricQueryDefinition(metricId)),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MetricDetailsPage metricId={metricId} />
    </HydrationBoundary>
  );
}
