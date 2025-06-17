import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";

export const qaCatalogDetailPage = (id: string, name?: string): PageInfo => ({
  key: "qaCatalog",
  name: "QACatalogPage.name",
  shortName: "QACatalogPage.shortName",
  nameArgs: { catalogId: id, name: name || id },
  href: `${qaCatalogsPage.href}/${id}`,
  parent: qaCatalogsPage,
});
