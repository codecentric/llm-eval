import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { NewLlmEndpointPage } from "@/app/[locale]/(authenticated)/llm-endpoints/new/components/new-llm-endpoint-page";
import { llmEndpointTypesQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithLocale } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { newLlmEndpointPage } from "./page-info";

export const generateMetadata = pageMetadata(newLlmEndpointPage);

export default async function NewLLMEndpoint({ params }: PropsWithLocale) {
  const { locale } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(llmEndpointTypesQueryDefinition),
  );

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewLlmEndpointPage contextHelp={<ContextHelp />} />
    </HydrationBoundary>
  );
}
