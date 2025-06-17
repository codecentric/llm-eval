"use client";

import { Alert, Button } from "@heroui/react";
import { useQueries } from "@tanstack/react-query";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdAdd } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { evaluationDetailsSummeryQueryDefinition } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { EvaluationSelectionPopover } from "@/app/[locale]/(authenticated)/eval/components/evaluation-selection-popover";
import {
  ErrorDisplay,
  WrappedError,
} from "@/app/[locale]/components/error-display";
import { clientQueryOptions } from "@/app/utils/react-query/client";

import { EvaluationInformationPanel } from "./evaluation-information-panel";
import { MetricResultsPanel } from "./metric-results-panel";
import { ScoreBoxPlotPanel } from "./score-box-plot-panel";
import { ScoreDistributionPanel } from "./score-distribution-panel";

export type EvaluationComparePageProps = {
  evaluationIds: string[];
};

export const EvaluationComparePage: React.FC<EvaluationComparePageProps> = ({
  evaluationIds,
}) => {
  const t = useTranslations();

  const results = useQueries({
    queries: evaluationIds.map((evaluationId) =>
      clientQueryOptions(evaluationDetailsSummeryQueryDefinition(evaluationId)),
    ),
  });

  const errors = useMemo(
    () =>
      results
        .map(
          (result, index) =>
            result.error && {
              error: result.error,
              evaluationId: evaluationIds[index],
            },
        )
        .filter((error) => !!error),
    [results, evaluationIds],
  );

  const evaluations = useMemo(
    () =>
      results
        .map((result) => result.data)
        .filter((data) => !!data)
        .map((evaluation) => ({
          ...evaluation,
          metrics: evaluation?.metrics
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name)),
          metricResults: evaluation?.metricResults
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name)),
          metricScores: evaluation?.metricScores
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name)),
        })),
    [results],
  );

  const [addOpen, setAddOpen] = useState(false);

  const addEvaluationsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (addEvaluationsRef.current && evaluationIds.length === 1) {
      addEvaluationsRef.current.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(
    () => [
      <EvaluationSelectionPopover
        key="add"
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        currentSelection={evaluationIds}
        color="primary"
      >
        <PageAction
          icon={MdAdd}
          text={t("EvaluationComparePage.action.add")}
          onPress={() => setAddOpen(!addOpen)}
          inlineText
          ref={addEvaluationsRef}
        />
      </EvaluationSelectionPopover>,
    ],
    [t, addOpen, setAddOpen, evaluationIds],
  );

  return (
    <PageContent
      pageInfo={evaluationComparePage(evaluationIds)}
      actions={actions}
      noPadding
    >
      <div className="flex flex-col h-full">
        {errors.length > 0 && (
          <div className="px-4 pt-4 sticky top-0 left-0 z-40 bg-background">
            {errors.length === 1 && (
              <ErrorDisplay
                message={t("EvaluationComparePage.error.evaluationLoad", {
                  id: errors[0].evaluationId,
                })}
                error={errors[0].error}
              />
            )}
            {errors.length > 1 && (
              <ErrorDisplay
                message={t("page.genericDataLoadError")}
                error={errors.map<WrappedError>((item) => ({
                  error: item.error,
                  title: item.evaluationId,
                }))}
              />
            )}
          </div>
        )}

        {evaluations.length ? (
          <div
            className={cx(
              "grid",
              "gap-y-4",
              "gap-x-8",
              `grid-cols-[repeat(var(--custom-compare-grid-columns),minmax(500px,1fr))]`,
              "auto-rows-min",
              "overflow-auto",
              "p-4",
              "flex-1",
            )}
            style={
              {
                "--custom-compare-grid-columns": evaluationIds.length,
              } as React.CSSProperties
            }
          >
            {evaluations.map((evaluation) => (
              <EvaluationInformationPanel
                key={evaluation.id}
                evaluation={evaluation}
                disableRemove={evaluations.length <= 1}
                selectedEvaluationIds={evaluationIds}
              />
            ))}
            <MetricResultsPanel evaluations={evaluations} />
            {evaluations.map((evaluation) => (
              <ScoreDistributionPanel
                key={evaluation.id}
                evaluation={evaluation}
              />
            ))}
            {evaluations.map((evaluation) => (
              <ScoreBoxPlotPanel key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        ) : (
          <div className="p-4">
            <Alert
              title={t("EvaluationComparePage.empty.alert")}
              color="primary"
              variant="faded"
            >
              <div className="flex mt-3">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => addEvaluationsRef.current?.click()}
                >
                  {t("EvaluationComparePage.action.add")}
                </Button>
              </div>
            </Alert>
          </div>
        )}
      </div>
    </PageContent>
  );
};
