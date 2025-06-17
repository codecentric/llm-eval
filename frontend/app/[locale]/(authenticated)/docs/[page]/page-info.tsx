import { MdOutlineArticle } from "react-icons/md";

import { documentationPage } from "@/app/[locale]/(authenticated)/docs/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const documentationPagePage: (
  name: string,
  title: string,
) => PageInfo = (name, title) => ({
  key: "docs-page",
  name: title,
  rawName: true,
  href: `/docs/${name}`,
  icon: <MdOutlineArticle />,
  parent: documentationPage,
});
