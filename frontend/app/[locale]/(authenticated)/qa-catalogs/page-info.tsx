import { GrCatalog } from "react-icons/gr";

import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const qaCatalogsPage: PageInfo = {
  key: "qaCatalogs",
  name: "QACatalogsPage.name",
  href: "/qa-catalogs",
  icon: <GrCatalog />,
  parent: homePage,
};
