import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { LlmEndpointEditPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/edit/components/llm-endpoint-edit-page";
import {
  llmEndpointQueryDefinition,
  llmEndpointTypesQueryDefinition,
} from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { PropsWithParams, PropsWithSearchParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { llmEndpointEditPage } from "./page-info";

type Props = PropsWithParams<{ endpointId: string; locale: string }> &
  PropsWithSearchParams<{ origin?: EditOrigin }>;

export const generateMetadata = pageMetadata(
  llmEndpointEditPage,
  async ({ params }: Props) => {
    const { endpointId } = await params;

    return [{ endpointId }] as const;
  },
);

export default async function EditLLMEndpoint({ params, searchParams }: Props) {
  const { endpointId, locale } = await params;
  const { origin } = await searchParams;

  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      serverQueryOptions(llmEndpointQueryDefinition(endpointId)),
    ),
    queryClient.prefetchQuery(
      serverQueryOptions(llmEndpointTypesQueryDefinition),
    ),
  ]);

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LlmEndpointEditPage
        endpointId={endpointId}
        origin={origin}
        contextHelp={<ContextHelp />}
      />
    </HydrationBoundary>
  );
}
