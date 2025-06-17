import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { NewMetricPage } from "@/app/[locale]/(authenticated)/metrics/components/new-metric-page";
import { metricTypesQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithLocale } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { newMetricPage } from "./page-info";

export const generateMetadata = pageMetadata(newMetricPage);

export default async function NewMetric({ params }: PropsWithLocale) {
  const { locale } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(metricTypesQueryDefinition),
  );

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewMetricPage contextHelp={<ContextHelp />} />
    </HydrationBoundary>
  );
}
