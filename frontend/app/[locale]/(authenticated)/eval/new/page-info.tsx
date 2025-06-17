import { MdPlayArrow } from "react-icons/md";

import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { buildQueryParams } from "@/app/utils/url";

type Params = {
  catalogId?: string;
  origin?: StartEvalOrigin;
};

export const newEvaluationPage = ({
  origin,
  catalogId,
}: Params = {}): PageInfo => ({
  key: "newEvaluation",
  name: "NewEvaluationPage.name",
  href: `${evaluationsPage.href}/new${buildQueryParams({ catalog: catalogId, origin })}`,
  icon: <MdPlayArrow />,
  parent: evaluationsPage,
});
