"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { LlmEndpointFormWizard } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-form-wizard";
import { newLlmEndpointPage } from "@/app/[locale]/(authenticated)/llm-endpoints/new/page-info";
import { llmEndpointTypesQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type NewLlmEndpointPageProps = {
  contextHelp: React.ReactElement;
};

export const NewLlmEndpointPage: React.FC<NewLlmEndpointPageProps> = ({
  contextHelp,
}) => {
  const { data: llmEndpointTypesData, error: llmEndpointTypesError } = useQuery(
    clientQueryOptions(llmEndpointTypesQueryDefinition),
  );

  return (
    <PageContent pageInfo={newLlmEndpointPage} helpPage={contextHelp}>
      <DisplayContentOrError error={llmEndpointTypesError}>
        {llmEndpointTypesData && (
          <LlmEndpointFormWizard endpointTypes={llmEndpointTypesData.types} />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
