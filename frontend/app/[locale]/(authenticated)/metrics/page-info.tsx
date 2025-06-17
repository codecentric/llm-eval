import { MdSsidChart } from "react-icons/md";

import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const metricsPage: PageInfo = {
  key: "metrics",
  name: "MetricsPage.name",
  href: "/metrics",
  icon: <MdSsidChart />,
  parent: homePage,
};
