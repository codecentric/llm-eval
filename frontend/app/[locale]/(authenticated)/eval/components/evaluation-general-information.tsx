import { useFormatter, useTranslations } from "next-intl";
import React from "react";

import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { NameValueGrid } from "@/app/[locale]/components/name-value-grid";
import { FULL_NUMERIC_DATE_FORMAT_OPTIONS } from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";
import { EvaluationDetailSummary } from "@/app/client";
import { NavigationLink } from "@/app/components/navigation-link";

export type EvaluationGeneralInformationProps = {
  evaluation: EvaluationDetailSummary;
};

export const EvaluationGeneralInformation: React.FC<
  EvaluationGeneralInformationProps
> = ({ evaluation }) => {
  const t = useTranslations();
  const formatter = useFormatter();

  return (
    <div className="flex">
      <NameValueGrid
        className="ml-4"
        items={[
          {
            key: "createdAt",
            name: t("EvaluationDetailSummary.generalInformation.createdAt"),
            value: formatter.dateTime(
              new Date(evaluation.createdAt),
              FULL_NUMERIC_DATE_FORMAT_OPTIONS,
            ),
          },
          {
            key: "numberOfTestCases",
            name: t(
              "EvaluationDetailSummary.generalInformation.numberOfTestCases",
            ),
            value: evaluation.testCaseProgress.total,
          },
          ...(evaluation.qaCatalog
            ? [
                {
                  key: "qaCatalog",
                  name: t(
                    "EvaluationDetailSummary.generalInformation.qaCatalog",
                  ),
                  value: (
                    <NavigationLink
                      className="text-[length:inherit]"
                      href={qaCatalogDetailPage(evaluation.qaCatalog.id).href}
                    >
                      {evaluation.qaCatalog.name}
                    </NavigationLink>
                  ),
                },
                {
                  key: "qaPairCount",
                  name: t(
                    "EvaluationDetailSummary.generalInformation.qaPairCount",
                  ),
                  value: evaluation.qaCatalog.qaPairCount,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};
