import { MdAdd } from "react-icons/md";

import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const newMetricPage: PageInfo = {
  key: "newMetric",
  name: "NewMetricPage.name",
  href: "/metrics/new",
  icon: <MdAdd />,
  parent: metricsPage,
};
