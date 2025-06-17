"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { MetricFormWizard } from "@/app/[locale]/(authenticated)/metrics/components/metric-form-wizard";
import { newMetricPage } from "@/app/[locale]/(authenticated)/metrics/new/page-info";
import { metricTypesQueryDefinition } from "@/app/[locale]/(authenticated)/metrics/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type NewMetricPageProps = {
  contextHelp: React.ReactElement;
};

export const NewMetricPage: React.FC<NewMetricPageProps> = ({
  contextHelp,
}) => {
  const { data: metricTypesData, error: metricTypesError } = useQuery(
    clientQueryOptions(metricTypesQueryDefinition),
  );

  return (
    <PageContent pageInfo={newMetricPage} helpPage={contextHelp}>
      <DisplayContentOrError error={metricTypesError}>
        {metricTypesData && (
          <MetricFormWizard metricTypes={metricTypesData.types} />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
