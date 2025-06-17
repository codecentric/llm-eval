"use client";

import { useQuery } from "@tanstack/react-query";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { metricEditPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/edit/page-info";
import { MetricFormWizard } from "@/app/[locale]/(authenticated)/metrics/components/metric-form-wizard";
import {
  metricQueryDefinition,
  metricTypesQueryDefinition,
} from "@/app/[locale]/(authenticated)/metrics/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { EditOrigin } from "@/app/types/edit-origin";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type MetricEditPageProps = {
  metricId: string;
  origin?: EditOrigin;
  contextHelp: React.ReactElement;
};

export const MetricEditPage = ({
  metricId,
  origin,
  contextHelp,
}: MetricEditPageProps) => {
  const { data: metricData, error: metricError } = useQuery(
    clientQueryOptions(metricQueryDefinition(metricId)),
  );

  const { data: metricTypesData, error: metricTypesError } = useQuery(
    clientQueryOptions(metricTypesQueryDefinition),
  );

  return (
    <PageContent
      pageInfo={metricEditPage({
        metricId,
        name: metricData?.configuration.name,
        origin,
      })}
      helpPage={contextHelp}
    >
      <DisplayContentOrError error={metricError || metricTypesError}>
        {metricData && metricTypesData && (
          <MetricFormWizard
            metricTypes={metricTypesData.types}
            metric={metricData}
            origin={origin}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
