"use client";
import { useTranslations } from "next-intl";
import { MdAutoAwesome } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { generateQACatalogPage } from "@/app/[locale]/(authenticated)/qa-catalogs/generate/page-info";

export const NavigateToGenerationPageAction = () => {
  const t = useTranslations();

  return (
    <PageAction
      icon={MdAutoAwesome}
      href={generateQACatalogPage.href}
      asLink={true}
      text={t("QACatalogPage.navigateToGeneration")}
      inlineText
    />
  );
};
