import { VscRunCoverage } from "react-icons/vsc";

import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { buildQueryParams } from "@/app/utils/url";

import { EvaluationDetailsTab } from "./types";

export type EvaluationPageProps = {
  evaluationId: string;
  name?: string;
  tab?: EvaluationDetailsTab;
};

export const evaluationPage = ({
  evaluationId,
  name,
  tab,
}: EvaluationPageProps): PageInfo => ({
  key: "execution",
  name: "ExecutionPage.name",
  shortName: "ExecutionPage.shortName",
  nameArgs: { name: name || evaluationId },
  href: `${evaluationsPage.href}/${evaluationId}${buildQueryParams({ tab }, { tab: EvaluationDetailsTab.OVERVIEW })}`,
  icon: <VscRunCoverage />,
  parent: evaluationsPage,
});
