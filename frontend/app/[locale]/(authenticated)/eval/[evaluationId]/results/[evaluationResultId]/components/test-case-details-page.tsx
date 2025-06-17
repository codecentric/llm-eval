"use client";

import { useQuery } from "@tanstack/react-query";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { evaluationQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { EvaluationResultDetails } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/components/evaluation-result-details";
import { TestCaseStatusChip } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/components/test-case-status-chip";
import { executionEvaluationResultPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/page-info";
import { testCaseQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type TestCaseDetailsPageProps = {
  evaluationId: string;
  testCaseId: string;
};

export const TestCaseDetailsPage = ({
  evaluationId,
  testCaseId,
}: TestCaseDetailsPageProps) => {
  const { data: testCaseData, error: testCaseError } = useQuery(
    clientQueryOptions(testCaseQueryDefinition(testCaseId)),
  );

  const { data: evaluationData } = useQuery(
    clientQueryOptions(evaluationQueryDefinition(evaluationId)),
  );

  return (
    <PageContent
      pageInfo={executionEvaluationResultPage(
        evaluationId,
        testCaseId,
        evaluationData?.name,
      )}
      titleEnd={
        testCaseData ? (
          <TestCaseStatusChip status={testCaseData.status} />
        ) : null
      }
    >
      <DisplayContentOrError error={testCaseError}>
        {testCaseData && <EvaluationResultDetails result={testCaseData} />}
      </DisplayContentOrError>
    </PageContent>
  );
};
