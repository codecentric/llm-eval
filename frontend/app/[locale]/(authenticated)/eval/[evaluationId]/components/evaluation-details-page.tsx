"use client";

import { addToast } from "@heroui/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import {
  MdCompareArrows,
  MdDelete,
  MdEdit,
  MdFileDownload,
} from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import {
  PageTab,
  TabbedPageContent,
} from "@/app/[locale]/(authenticated)/components/tabbed-page-content";
import { EvaluationDetailSummary } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/components/evaluation-detail-summary";
import { downloadEvaluationResults } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/download";
import { evaluationEditPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/edit/page-info";
import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import {
  evaluationDetailsSummeryQueryDefinition,
  groupedTestCasesQueryDefinition,
} from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { EvaluationDetailsTab } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/types";
import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { EvaluationResultsTable } from "@/app/[locale]/(authenticated)/eval/components/evaluation-results-table";
import { EvaluationStatusChip } from "@/app/[locale]/(authenticated)/eval/components/evaluation-status-chip";
import { useEvaluationDelete } from "@/app/[locale]/(authenticated)/eval/hooks/use-evaluation-delete";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { EditOrigin } from "@/app/types/edit-origin";
import {
  clientInfiniteQueryOptions,
  clientQueryOptions,
} from "@/app/utils/react-query/client";
import { useRouter } from "@/i18n/routing";

export type EvaluationDetailsPageProps = {
  evaluationId: string;
  tab: EvaluationDetailsTab;
};

export const EvaluationDetailsPage = ({
  evaluationId,
  tab,
}: EvaluationDetailsPageProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [downloading, setDownloading] = useState<boolean>(false);

  const {
    data: evaluationDetailsSummary,
    error: evaluationDetailsSummaryError,
    refetch: refetchEvaluationDetailsSummary,
  } = useQuery(
    clientQueryOptions(evaluationDetailsSummeryQueryDefinition(evaluationId)),
  );

  const {
    data: testCases,
    error: testCasesError,
    hasNextPage: hasMoreTestCases,
    fetchNextPage: loadMoreTestCases,
    refetch: refetchTestCases,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(groupedTestCasesQueryDefinition(evaluationId)),
  );

  const loadMore = useCallback(async () => {
    await loadMoreTestCases();
  }, [loadMoreTestCases]);

  const onStatusPoll = useCallback(
    () => Promise.all([refetchEvaluationDetailsSummary(), refetchTestCases()]),
    [refetchEvaluationDetailsSummary, refetchTestCases],
  );

  const downloadHandler = useCallback(
    () =>
      downloadEvaluationResults(evaluationId, {
        onStart: async () => setDownloading(true),
        onFinish: async () => setDownloading(false),
      }),
    [evaluationId, setDownloading],
  );

  const { delete: deleteEvaluation } = useEvaluationDelete({
    onSuccess: ({ message }) => {
      router.replace(evaluationsPage.href);
      addToast({ title: message, color: "success" });
    },
  });

  const deleteHandler = useCallback(() => {
    if (evaluationDetailsSummary) {
      deleteEvaluation(evaluationDetailsSummary);
    }
  }, [evaluationDetailsSummary, deleteEvaluation]);

  const metrics = useMemo(
    () =>
      evaluationDetailsSummary?.metrics
        .map((metric) => ({
          id: metric.id,
          name: metric.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    [evaluationDetailsSummary],
  );

  const tabs = useMemo<PageTab[]>(
    () => [
      {
        key: EvaluationDetailsTab.OVERVIEW,
        title: t("EvaluationDetailsPage.tab.overview"),
        content: (
          <DisplayContentOrError error={evaluationDetailsSummaryError}>
            {evaluationDetailsSummary && (
              <EvaluationDetailSummary
                key="summary"
                evaluationDetailSummary={evaluationDetailsSummary}
              />
            )}
          </DisplayContentOrError>
        ),
        url: evaluationPage({
          evaluationId,
          tab: EvaluationDetailsTab.OVERVIEW,
        }).href,
      },
      {
        key: EvaluationDetailsTab.RESULTS,
        title: t("EvaluationDetailsPage.tab.testCases"),
        content: (
          <DisplayContentOrError error={testCasesError}>
            {testCases && (
              <EvaluationResultsTable
                key="testCases"
                evaluationId={evaluationId}
                metrics={metrics}
                results={testCases}
                hasMore={hasMoreTestCases}
                loadMore={loadMore}
              />
            )}
          </DisplayContentOrError>
        ),
        url: evaluationPage({
          evaluationId,
          tab: EvaluationDetailsTab.RESULTS,
        }).href,
      },
    ],
    [
      evaluationDetailsSummary,
      evaluationDetailsSummaryError,
      evaluationId,
      hasMoreTestCases,
      loadMore,
      metrics,
      t,
      testCases,
      testCasesError,
    ],
  );

  return (
    <TabbedPageContent
      pageInfo={evaluationPage({
        evaluationId,
        name: evaluationDetailsSummary?.name ?? evaluationId,
      })}
      titleEnd={
        evaluationDetailsSummary && (
          <EvaluationStatusChip
            status={evaluationDetailsSummary.status}
            progress={evaluationDetailsSummary.testCaseProgress}
            onUpdate={onStatusPoll}
          />
        )
      }
      actions={[
        <PageAction
          key="edit"
          icon={MdEdit}
          href={
            evaluationEditPage({ evaluationId, origin: EditOrigin.DETAILS })
              .href
          }
          asLink
          text={t("EvaluationDetailsPage.edit")}
          isDisabled={!evaluationDetailsSummary}
        />,
        <PageAction
          key="downloadResults"
          icon={MdFileDownload}
          isLoading={downloading}
          onPress={downloadHandler}
          text={t("EvaluationDetailsPage.downloadResults")}
          isDisabled={!testCases}
        />,
        <PageAction
          key="compare"
          icon={MdCompareArrows}
          text={t("EvaluationDetailsPage.compare")}
          href={evaluationComparePage([evaluationId]).href}
          asLink
        />,
        <PageAction
          key="delete"
          color="danger"
          icon={MdDelete}
          isDisabled={!evaluationDetailsSummary}
          onPress={deleteHandler}
          text={t("DetailsPage.delete")}
        />,
      ]}
      tabs={tabs}
      selectedTabKey={tab}
    />
  );
};
