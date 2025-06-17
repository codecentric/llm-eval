import { MdChecklist } from "react-icons/md";

import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const evaluationsPage: PageInfo = {
  key: "evaluations",
  name: "EvaluationsPage.name",
  href: `${homePage.href}eval`,
  icon: <MdChecklist />,
  parent: homePage,
};
