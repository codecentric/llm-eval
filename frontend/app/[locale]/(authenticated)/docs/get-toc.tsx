import { getTranslations } from "next-intl/server";

export type PageSection = {
  title: string;
  items: PageItem[];
};

export type PageItem = {
  title: string;
  name: string;
};

const indexStructure: { section: string; pages: string[] }[] = [
  {
    section: "DocumentationPage.section.gettingStarted",
    pages: ["setup"],
  },
];

export const getDocumentationToc = async (locale: string) => {
  const t = await getTranslations();

  const sections: PageSection[] = [];

  for (const indexSection of indexStructure) {
    const section: PageSection = {
      title: t(indexSection.section),
      items: [],
    };

    for (const page of indexSection.pages) {
      await addPage(section.items, page, locale);
    }

    sections.push(section);
  }

  return sections;
};

const addPage = async (pageItems: PageItem[], page: string, locale: string) => {
  const { metadata } = await import(
    `@/app/[locale]/(authenticated)/docs/[page]/pages/${locale}/${page}.mdx`
  );

  pageItems.push({
    title: metadata.title,
    name: page,
  });
};
