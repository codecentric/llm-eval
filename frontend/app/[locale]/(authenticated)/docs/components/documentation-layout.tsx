import React from "react";

import { DocumentationToc } from "./documentation-toc";

import type { PageSection } from "@/app/[locale]/(authenticated)/docs/get-toc";

export type DocumentationLayoutProps = React.PropsWithChildren<{
  sections: PageSection[];
}>;

export const DocumentationLayout: React.FC<DocumentationLayoutProps> = ({
  children,
  sections,
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 min-h-full">
      <DocumentationToc
        className="col-span-2 flex sticky top-0 self-start"
        sections={sections}
      />
      <div className="col-span-10 prose max-w-full">{children}</div>
    </div>
  );
};
