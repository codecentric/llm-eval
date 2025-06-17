import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { evaluationQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { TestCaseDetailsPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/components/test-case-details-page";
import { testCaseQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { executionEvaluationResultPage } from "./page-info";

type Props = PropsWithParams<{
  evaluationId: string;
  evaluationResultId: string;
}>;

export const generateMetadata = pageMetadata(
  executionEvaluationResultPage,
  async ({ params }: Props) => {
    const { evaluationId, evaluationResultId } = await params;

    return [evaluationId, evaluationResultId] as const;
  },
);

export default async function EvaluationResultPage({ params }: Props) {
  const { evaluationId, evaluationResultId } = await params;

  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      serverQueryOptions(testCaseQueryDefinition(evaluationResultId)),
    ),
    queryClient.prefetchQuery(
      serverQueryOptions(evaluationQueryDefinition(evaluationId)),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TestCaseDetailsPage
        evaluationId={evaluationId}
        testCaseId={evaluationResultId}
      />
    </HydrationBoundary>
  );
}
