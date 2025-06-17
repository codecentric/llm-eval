import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { EvaluationDetailsPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/components/evaluation-details-page";
import {
  evaluationDetailsSummeryQueryDefinition,
  groupedTestCasesQueryDefinition,
} from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithParams, PropsWithSearchParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { evaluationPage } from "./page-info";
import { EvaluationDetailsTab } from "./types";

type Props = PropsWithParams<
  { evaluationId: string },
  PropsWithSearchParams<{ tab?: EvaluationDetailsTab }>
>;

export const generateMetadata = pageMetadata(
  evaluationPage,
  async ({ params }: Props) => {
    const { evaluationId } = await params;

    return [{ evaluationId }] as const;
  },
);

export default async function Evaluation({ params, searchParams }: Props) {
  const { evaluationId } = await params;
  const { tab = EvaluationDetailsTab.OVERVIEW } = await searchParams;

  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      serverQueryOptions(evaluationDetailsSummeryQueryDefinition(evaluationId)),
    ),
    queryClient.prefetchInfiniteQuery(
      serverInfiniteQueryOptions(groupedTestCasesQueryDefinition(evaluationId)),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EvaluationDetailsPage evaluationId={evaluationId} tab={tab} />
    </HydrationBoundary>
  );
}
