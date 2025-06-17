import { MdEdit } from "react-icons/md";

import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { buildQueryParams } from "@/app/utils/url";

export const metricEditPage = ({
  metricId,
  name,
  origin,
}: {
  metricId: string;
  name?: string;
  origin?: EditOrigin;
}): PageInfo => ({
  key: "metricEdit",
  name: "MetricEditPage.name",
  shortName: "MetricEditPage.shortName",
  nameArgs: { metricId, name: name ?? metricId },
  href: `/metrics/${metricId}/edit${buildQueryParams({ origin })}`,
  icon: <MdEdit />,
  parent: metricDetailsPage(metricId, name),
});
