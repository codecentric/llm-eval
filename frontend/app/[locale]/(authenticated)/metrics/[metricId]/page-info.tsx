import { MdRemoveRedEye } from "react-icons/md";

import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const metricDetailsPage = (
  metricId: string,
  name?: string,
): PageInfo => ({
  key: "metricDetails",
  name: "MetricDetailsPage.name",
  shortName: "MetricDetailsPage.shortName",
  nameArgs: { metricId, name: name ?? metricId },
  href: `/metrics/${metricId}`,
  icon: <MdRemoveRedEye />,
  parent: metricsPage,
});
