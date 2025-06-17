import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { NewEvaluationPage } from "@/app/[locale]/(authenticated)/eval/new/components/new-evaluation-page";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { allMetricsQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { qaCatalogQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/queries";
import { PropsWithSearchParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { newEvaluationPage } from "./page-info";

type Props = PropsWithSearchParams<{
  catalog?: string;
  origin?: StartEvalOrigin;
}>;

export const generateMetadata = pageMetadata(
  newEvaluationPage,
  async ({ searchParams }: Props) => {
    const { catalog, origin } = await searchParams;

    return [{ catalogId: catalog, origin }] as const;
  },
);

export default async function NewEvaluation({ searchParams }: Props) {
  const { catalog, origin } = await searchParams;

  const queryClient = makeQueryClient();

  const queries: Promise<void>[] = [
    queryClient.prefetchQuery(serverQueryOptions(allMetricsQueryDefinition)),
  ];

  if (catalog) {
    queries.push(
      queryClient.prefetchQuery(
        serverQueryOptions(qaCatalogQueryDefinition(catalog)),
      ),
    );
  }

  await Promise.all(queries);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewEvaluationPage
        catalogId={catalog}
        origin={
          origin ??
          (catalog ? StartEvalOrigin.CATALOG : StartEvalOrigin.EVALUATIONS)
        }
      />
    </HydrationBoundary>
  );
}
