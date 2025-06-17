"use client";

import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { documentationPage } from "@/app/[locale]/(authenticated)/docs/page-info";

import { DocumentationLayout } from "./documentation-layout";

import type { PageSection } from "@/app/[locale]/(authenticated)/docs/get-toc";

export type DocumentationPageProps = {
  sections: PageSection[];
};

export const DocumentationPage: React.FC<DocumentationPageProps> = ({
  sections,
}) => {
  return (
    <PageContent pageInfo={documentationPage}>
      <DocumentationLayout sections={sections} />
    </PageContent>
  );
};
