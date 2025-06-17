import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { evaluationQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { PropsWithParams, PropsWithSearchParams } from "@/app/types/page-types";
import { fetchIgnoringErrors } from "@/app/utils/react-query/server-fetch";

import { EvaluationEditPage } from "./components/evaluation-edit-page";
import { evaluationEditPage } from "./page-info";

type Props = PropsWithParams<{ evaluationId: string }> &
  PropsWithSearchParams<{ origin?: EditOrigin }>;

export const generateMetadata = pageMetadata(
  evaluationEditPage,
  async ({ params }: Props) => {
    const { evaluationId } = await params;

    const { data: evaluation } = await fetchIgnoringErrors(
      evaluationQueryDefinition(evaluationId),
    );

    return [{ evaluationId, name: evaluation?.name }] as const;
  },
);

export default async function Evaluation({ params, searchParams }: Props) {
  const { evaluationId } = await params;
  const { origin } = await searchParams;

  const { queryClient } = await fetchIgnoringErrors(
    evaluationQueryDefinition(evaluationId),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EvaluationEditPage evaluationId={evaluationId} origin={origin} />
    </HydrationBoundary>
  );
}
