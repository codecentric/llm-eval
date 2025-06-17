import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { MetricEditPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/edit/components/metric-edit-page";
import {
  metricQueryDefinition,
  metricTypesQueryDefinition,
} from "@/app/[locale]/(authenticated)/metrics/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { PropsWithParams, PropsWithSearchParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { metricEditPage } from "./page-info";

type Props = PropsWithParams<{ metricId: string; locale: string }> &
  PropsWithSearchParams<{ origin?: EditOrigin }>;

export const generateMetadata = pageMetadata(
  metricEditPage,
  async ({ params }: Props) => {
    const { metricId } = await params;

    return [{ metricId }] as const;
  },
);

export default async function EditMetric({ params, searchParams }: Props) {
  const { origin } = await searchParams;
  const { metricId, locale } = await params;

  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      serverQueryOptions(metricQueryDefinition(metricId)),
    ),
    queryClient.prefetchQuery(serverQueryOptions(metricTypesQueryDefinition)),
  ]);

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MetricEditPage
        metricId={metricId}
        origin={origin}
        contextHelp={<ContextHelp />}
      />
    </HydrationBoundary>
  );
}
