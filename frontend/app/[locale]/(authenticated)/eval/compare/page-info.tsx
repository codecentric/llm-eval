import { MdCompareArrows } from "react-icons/md";

import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { buildQueryParams } from "@/app/utils/url";

export const evaluationComparePage = (evaluationIds?: string[]): PageInfo => ({
  key: "evaluationCompare",
  name: "EvaluationComparePage.name",
  shortName: "EvaluationComparePage.shortName",
  href: `${evaluationsPage.href}/compare${buildQueryParams({ e: evaluationIds ?? undefined })}`,
  icon: <MdCompareArrows />,
  parent: evaluationsPage,
});
