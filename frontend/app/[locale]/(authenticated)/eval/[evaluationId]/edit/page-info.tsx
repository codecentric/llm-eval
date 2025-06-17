import { MdEdit } from "react-icons/md";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { buildQueryParams } from "@/app/utils/url";

export const evaluationEditPage = ({
  evaluationId,
  name,
  origin,
}: {
  evaluationId: string;
  name?: string;
  origin?: EditOrigin;
}): PageInfo => ({
  key: "evaluationEdit",
  name: "EvaluationEditPage.name",
  shortName: "EvaluationEditPage.shortName",
  nameArgs: { evaluationId, name: name ?? evaluationId },
  href: `/eval/${evaluationId}/edit${buildQueryParams({ origin })}`,
  icon: <MdEdit />,
  parent: evaluationPage({ evaluationId, name }),
});
