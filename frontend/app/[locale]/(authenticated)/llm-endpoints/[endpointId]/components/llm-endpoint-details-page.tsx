"use client";

import { addToast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { DetailsPage } from "@/app/[locale]/(authenticated)/components/details-page";
import { LlmEndpointDetails } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/components/llm-endpoint-details";
import { llmEndpointEditPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/edit/page-info";
import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { useEndpointDelete } from "@/app/[locale]/(authenticated)/llm-endpoints/hooks/use-endpoint-delete";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import { llmEndpointQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { usePageData } from "@/app/[locale]/hooks/use-page-data";
import { LlmEndpoint } from "@/app/client";
import { clientQueryOptions } from "@/app/utils/react-query/client";
import { useRouter } from "@/i18n/routing";

export type LlmEndpointDetailsPageProps = {
  endpointId: string;
};

export const LlmEndpointDetailsPage = ({
  endpointId,
}: LlmEndpointDetailsPageProps) => {
  const router = useRouter();

  const { data: llmEndpointData, error: llmEndpointError } = useQuery(
    clientQueryOptions(llmEndpointQueryDefinition(endpointId)),
  );

  const { delete: deleteEndpoint } = useEndpointDelete({
    onSuccess: ({ message }) => {
      router.replace(llmEndpointsPage.href);
      addToast({ title: message, color: "success" });
    },
  });

  const content = useCallback(
    (endpoint: LlmEndpoint) => <LlmEndpointDetails endpoint={endpoint} />,
    [],
  );

  const pageData = usePageData(llmEndpointData, llmEndpointError);

  return (
    <DetailsPage
      pageInfo={llmEndpointDetailsPage(endpointId, llmEndpointData?.name)}
      pageData={pageData}
      onDelete={(endpoint) => deleteEndpoint(endpoint)}
      onEdit={llmEndpointEditPage({ endpointId }).href}
    >
      {content}
    </DetailsPage>
  );
};
