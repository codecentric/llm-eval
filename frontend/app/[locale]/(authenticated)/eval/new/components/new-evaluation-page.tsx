"use client";

import { useQuery } from "@tanstack/react-query";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { NewEvaluationFormWizard } from "@/app/[locale]/(authenticated)/eval/new/components/new-evaluation-form-wizard";
import { newEvaluationPage } from "@/app/[locale]/(authenticated)/eval/new/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { allMetricsQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type NewEvaluationPageProps = {
  catalogId?: string;
  origin: StartEvalOrigin;
};

export const NewEvaluationPage = ({
  catalogId,
  origin,
}: NewEvaluationPageProps) => {
  const { data: allMetricsData, error: allMetricsError } = useQuery(
    clientQueryOptions(allMetricsQueryDefinition),
  );

  return (
    <PageContent pageInfo={newEvaluationPage()}>
      <DisplayContentOrError error={allMetricsError}>
        {allMetricsData ? (
          <NewEvaluationFormWizard
            catalogId={catalogId}
            origin={origin}
            availableMetrics={allMetricsData}
          />
        ) : null}
      </DisplayContentOrError>
    </PageContent>
  );
};
