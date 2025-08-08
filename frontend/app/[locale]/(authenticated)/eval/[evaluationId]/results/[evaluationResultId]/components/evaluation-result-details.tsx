import { useTranslations } from "next-intl";
import { PropsWithChildren } from "react";

import { MetricsTable } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/components/metrics-table";
import { ErrorDisplay } from "@/app/[locale]/components/error-display";
import {
  createListValueItem,
  PropertyList,
  PropertyListItem,
} from "@/app/[locale]/components/property-list";
import { LlmEvalEvalEvaluateResultsRouterEvaluationResult as EvaluationResult } from "@/app/client";

const TextValue = ({ children }: PropsWithChildren) => {
  return <div className="whitespace-pre-wrap overflow-x-auto">{children}</div>;
};

export type EvaluationResultDetailsProps = {
  result: EvaluationResult;
};

export const EvaluationResultDetails = ({
  result,
}: EvaluationResultDetailsProps) => {
  const t = useTranslations();

  const propertyListItems: PropertyListItem[] = [
    createListValueItem({
      label: t("EvaluationResultDetails.input"),
      value: result.input,
      fullWidth: true,
    }),
    createListValueItem({
      label: t("EvaluationResultDetails.expectedOutput"),
      value: result.expectedOutput,
      renderValue: (value) => <TextValue>{value}</TextValue>,
    }),
    createListValueItem({
      label: t("EvaluationResultDetails.actualOutput"),
      value: result.actualOutput || "-",
      renderValue: (value) => <TextValue>{value}</TextValue>,
    }),
    createListValueItem({
      label: t("EvaluationResultDetails.context"),
      value: result.context,
      renderArrayValue: (value) => <TextValue>{value}</TextValue>,
    }),
    createListValueItem({
      label: t("EvaluationResultDetails.retrievalContext"),
      value: result.retrievalContext,
      renderArrayValue: (value) => <TextValue>{value}</TextValue>,
    }),
    createListValueItem({
      label: t("EvaluationResultDetails.metrics"),
      value: result.metricsData,
      fullWidth: true,
      renderValue: (value) => <MetricsTable className="mt-2" metrics={value} />,
    }),
  ];

  return (
    <>
      {result.error && (
        <ErrorDisplay
          message={t("EvaluationResultDetails.errorTitle")}
          error={result.error}
          className="mb-4"
        />
      )}
      <PropertyList items={propertyListItems} />
    </>
  );
};
