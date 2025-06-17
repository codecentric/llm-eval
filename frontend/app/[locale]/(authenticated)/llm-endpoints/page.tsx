import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { LlmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoints-page";
import { llmEndpointsQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
} from "@/app/utils/react-query/server";

import { llmEndpointsPage } from "./page-info";

export const fetchCache = "force-no-store";

export const generateMetadata = pageMetadata(llmEndpointsPage);

export default async function LLMEndpoints() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchInfiniteQuery(
    serverInfiniteQueryOptions(llmEndpointsQueryDefinition()),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LlmEndpointsPage />
    </HydrationBoundary>
  );
}
