"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MdAdd } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { LLMEndpointsTable } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoints-table";
import { newLlmEndpointPage } from "@/app/[locale]/(authenticated)/llm-endpoints/new/page-info";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import { llmEndpointsQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientInfiniteQueryOptions } from "@/app/utils/react-query/client";

export const LlmEndpointsPage = () => {
  const t = useTranslations();

  const {
    data: llmEndpointsData,
    error: llmEndpointsError,
    hasNextPage: llmEndpointsHasNextPage,
    fetchNextPage: llmEndpointsFetchNextPage,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(llmEndpointsQueryDefinition()),
  );

  return (
    <PageContent
      pageInfo={llmEndpointsPage}
      actions={[
        <PageAction
          key="new"
          icon={MdAdd}
          href={newLlmEndpointPage.href}
          text={t("LLMEndpointsPage.new")}
          asLink
          inlineText
        />,
      ]}
    >
      <DisplayContentOrError
        error={llmEndpointsError}
        errorMessage={t("LLMEndpointsPage.responseError")}
      >
        {llmEndpointsData && (
          <LLMEndpointsTable
            items={llmEndpointsData}
            hasMore={llmEndpointsHasNextPage}
            loadMore={llmEndpointsFetchNextPage}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
