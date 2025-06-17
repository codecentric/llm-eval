import { PiListMagnifyingGlass } from "react-icons/pi";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const executionEvaluationResultPage = (
  evaluationId: string,
  resultId: string,
  evaluationName?: string,
): PageInfo => ({
  key: "executionEvaluationResult",
  name: "ExecutionEvaluationResultPage.name",
  shortName: "ExecutionEvaluationResultPage.shortName",
  nameArgs: { resultId },
  href: `${evaluationPage({ evaluationId, name: evaluationName }).href}/results/${resultId}`,
  parent: evaluationPage({ evaluationId, name: evaluationName }),
  icon: <PiListMagnifyingGlass />,
});
