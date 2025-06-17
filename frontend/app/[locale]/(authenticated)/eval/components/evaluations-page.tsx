"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { MdCompareArrows } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { EvaluationsTable } from "@/app/[locale]/(authenticated)/eval/components/evaluations-table";
import { NewEvaluationPageAction } from "@/app/[locale]/(authenticated)/eval/new/components/new-evaluation-page-action";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { evaluationsQueryDefinition } from "@/app/[locale]/(authenticated)/eval/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { EvaluationStatus, GetAllEvaluationResult } from "@/app/client";
import { ClientOnly } from "@/app/components/client-only";
import { clientInfiniteQueryOptions } from "@/app/utils/react-query/client";

export type EvaluationsPageProps = {
  contextHelp: React.ReactElement;
};

export const EvaluationsPage: React.FC<EvaluationsPageProps> = ({
  contextHelp,
}) => {
  const t = useTranslations();

  const {
    data: evaluationsData,
    error: evaluationsError,
    hasNextPage: evaluationsHasNextPage,
    fetchNextPage: evaluationsFetchNextPage,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(evaluationsQueryDefinition()),
  );

  const [selectedItems, setSelectedItems] = useState<
    readonly GetAllEvaluationResult[]
  >([]);

  const compareEvaluationIds = useMemo(
    () =>
      selectedItems
        .filter((item) => item.status === EvaluationStatus.SUCCESS)
        .map((item) => item.id),
    [selectedItems],
  );

  return (
    <PageContent
      pageInfo={evaluationsPage}
      actions={[
        <NewEvaluationPageAction key="startEvaluation" inlineText />,
        <PageAction
          key="compare"
          icon={MdCompareArrows}
          text={t("EvaluationsPage.action.compare")}
          isDisabled={compareEvaluationIds.length < 2}
          href={evaluationComparePage(compareEvaluationIds).href}
          asLink
        />,
      ]}
      helpPage={contextHelp}
    >
      <DisplayContentOrError
        error={evaluationsError}
        errorMessage={t("EvaluationsPage.responseError")}
      >
        {evaluationsData && (
          // ClientOnly is required to prevent hydration errors with the checkbox table
          <ClientOnly>
            <EvaluationsTable
              items={evaluationsData}
              hasMore={evaluationsHasNextPage}
              loadMore={evaluationsFetchNextPage}
              onSelectionChange={setSelectedItems}
            />
          </ClientOnly>
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
