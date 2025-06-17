import { MdHelpOutline } from "react-icons/md";

import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const documentationPage: PageInfo = {
  key: "docs",
  name: "DocumentationPage.name",
  href: "/docs",
  icon: <MdHelpOutline />,
  parent: homePage,
};
