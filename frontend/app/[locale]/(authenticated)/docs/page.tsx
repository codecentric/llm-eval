import { DocumentationPage } from "@/app/[locale]/(authenticated)/docs/components/documentation-page";
import { PropsWithLocale } from "@/app/types/page-types";

import { getDocumentationToc } from "./get-toc";

export default async function Documentation({ params }: PropsWithLocale) {
  const { locale } = await params;

  const sections = await getDocumentationToc(locale);

  return <DocumentationPage sections={sections} />;
}
