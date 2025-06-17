import { notFound } from "next/navigation";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { DocumentationLayout } from "@/app/[locale]/(authenticated)/docs/components/documentation-layout";
import { getDocumentationToc } from "@/app/[locale]/(authenticated)/docs/get-toc";
import { PropsWithLocale, PropsWithParams } from "@/app/types/page-types";

import { documentationPagePage } from "./page-info";

export default async function DocumentationPage({
  params,
}: PropsWithLocale<PropsWithParams<{ page: string }>>) {
  const { page: pageName, locale } = await params;

  let pageModule;

  try {
    pageModule = await import(
      `@/app/[locale]/(authenticated)/docs/[page]/pages/${locale}/${pageName}.mdx`
    );
  } catch (error) {
    if ((error as { code?: string }).code === "MODULE_NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  const { default: Page, metadata } = pageModule;

  const sections = await getDocumentationToc(locale);

  return (
    <PageContent pageInfo={documentationPagePage(pageName, metadata.title)}>
      <DocumentationLayout sections={sections}>
        <Page />
      </DocumentationLayout>
    </PageContent>
  );
}
