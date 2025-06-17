import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { evaluationDetailsSummeryQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithSearchParams } from "@/app/types/page-types";
import { makeQueryClient } from "@/app/utils/react-query/client";
import { serverQueryOptions } from "@/app/utils/react-query/server";

import { EvaluationComparePage } from "./components/evaluation-compare-page";
import { evaluationComparePage } from "./page-info";

type Props = PropsWithSearchParams<{ e?: string | string[] }>;

export const generateMetadata = pageMetadata(
  evaluationComparePage,
  async () => {
    return [] as const;
  },
);

export default async function Evaluation({ searchParams }: Props) {
  const { e } = await searchParams;

  const queryClient = makeQueryClient();

  const evaluationIds = Array.isArray(e) ? e : e ? [e] : [];

  await Promise.all(
    evaluationIds.map((evaluationId) =>
      queryClient.prefetchQuery(
        serverQueryOptions(
          evaluationDetailsSummeryQueryDefinition(evaluationId),
        ),
      ),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EvaluationComparePage evaluationIds={evaluationIds} />
    </HydrationBoundary>
  );
}
