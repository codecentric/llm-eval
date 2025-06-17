"use client";

import { Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import { useTranslations } from "next-intl";

import type { PageSection } from "@/app/[locale]/(authenticated)/docs/get-toc";

export type DocumentationTocProps = {
  sections: PageSection[];
  className?: string;
};

export const DocumentationToc: React.FC<DocumentationTocProps> = ({
  sections,
  className,
}) => {
  const t = useTranslations();

  return (
    <div className={className}>
      <Listbox
        aria-label={t("DocumentationToc.label")}
        variant="light"
        color="primary"
      >
        {sections.map((section) => (
          <ListboxSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <ListboxItem key={item.name} href={`/docs/${item.name}`}>
                {item.title}
              </ListboxItem>
            ))}
          </ListboxSection>
        ))}
      </Listbox>
    </div>
  );
};
