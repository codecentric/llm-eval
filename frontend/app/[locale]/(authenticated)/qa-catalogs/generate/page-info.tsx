import { MdAutoAwesome } from "react-icons/md";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";

export const generateQACatalogPage: PageInfo = {
  key: "generateQACatalog",
  name: "GenerateQACatalog.name",
  href: "/qa-catalogs/generate",
  icon: <MdAutoAwesome />,
  parent: qaCatalogsPage,
};
