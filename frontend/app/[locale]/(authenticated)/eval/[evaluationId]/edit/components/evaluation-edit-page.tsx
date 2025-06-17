"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { evaluationEditPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/edit/page-info";
import { evaluationQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { EditOrigin } from "@/app/types/edit-origin";
import { clientQueryOptions } from "@/app/utils/react-query/client";

import { EvaluationEditFormWizard } from "./evaluation-edit-form-wizard";

export type EvaluationEditPageProps = {
  evaluationId: string;
  origin?: EditOrigin;
};

export const EvaluationEditPage: React.FC<EvaluationEditPageProps> = ({
  evaluationId,
  origin,
}) => {
  const { data: evaluation, error: evaluationError } = useQuery(
    clientQueryOptions(evaluationQueryDefinition(evaluationId)),
  );

  return (
    <PageContent
      pageInfo={evaluationEditPage({ evaluationId, name: evaluation?.name })}
    >
      <DisplayContentOrError error={evaluationError}>
        {evaluation && (
          <EvaluationEditFormWizard evaluation={evaluation} origin={origin} />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
