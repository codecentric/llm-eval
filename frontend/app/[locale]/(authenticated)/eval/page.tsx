import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { EvaluationsPage } from "@/app/[locale]/(authenticated)/eval/components/evaluations-page";
import { evaluationsQueryDefinition } from "@/app/[locale]/(authenticated)/eval/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithLocale } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
} from "@/app/utils/react-query/server";

import { evaluationsPage } from "./page-info";

export const dynamic = "force-dynamic";

export const generateMetadata = pageMetadata(evaluationsPage);

export default async function Evaluations({ params }: PropsWithLocale) {
  const { locale } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchInfiniteQuery(
    serverInfiniteQueryOptions(evaluationsQueryDefinition()),
  );

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EvaluationsPage contextHelp={<ContextHelp />} />
    </HydrationBoundary>
  );
}
