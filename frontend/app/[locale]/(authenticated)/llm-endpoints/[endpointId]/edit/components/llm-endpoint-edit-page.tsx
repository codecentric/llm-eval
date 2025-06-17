"use client";

import { useQuery } from "@tanstack/react-query";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { llmEndpointEditPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/edit/page-info";
import { LlmEndpointFormWizard } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-form-wizard";
import {
  llmEndpointQueryDefinition,
  llmEndpointTypesQueryDefinition,
} from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { EditOrigin } from "@/app/types/edit-origin";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type LlmEndpointEditPageProps = {
  endpointId: string;
  origin?: EditOrigin;
  contextHelp: React.ReactElement;
};

export const LlmEndpointEditPage = ({
  endpointId,
  origin,
  contextHelp,
}: LlmEndpointEditPageProps) => {
  const { data: llmEndpointData, error: llmEndpointError } = useQuery(
    clientQueryOptions(llmEndpointQueryDefinition(endpointId)),
  );

  const { data: llmEndpointTypesData, error: llmEndpointTypesError } = useQuery(
    clientQueryOptions(llmEndpointTypesQueryDefinition),
  );

  return (
    <PageContent
      pageInfo={llmEndpointEditPage({
        endpointId,
        name: llmEndpointData?.name,
        origin,
      })}
      helpPage={contextHelp}
    >
      <DisplayContentOrError error={llmEndpointError || llmEndpointTypesError}>
        {llmEndpointData && llmEndpointTypesData && (
          <LlmEndpointFormWizard
            endpointTypes={llmEndpointTypesData.types}
            llmEndpoint={llmEndpointData}
            origin={origin}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
