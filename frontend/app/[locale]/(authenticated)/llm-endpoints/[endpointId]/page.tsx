import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { LlmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/components/llm-endpoint-details-page";
import { llmEndpointQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { llmEndpointDetailsPage } from "./page-info";

type Props = PropsWithParams<{ endpointId: string }>;

export const generateMetadata = pageMetadata(
  llmEndpointDetailsPage,
  async ({ params }: Props) => {
    const { endpointId } = await params;

    return [endpointId] as const;
  },
);

export default async function LLMEndpointDetails({ params }: Props) {
  const { endpointId } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(llmEndpointQueryDefinition(endpointId)),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LlmEndpointDetailsPage endpointId={endpointId} />
    </HydrationBoundary>
  );
}
