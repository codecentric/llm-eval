import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";

import { usePathname, useRouter } from "@/i18n/routing";

export const LanguageSelect = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateLocale = useCallback(
    (keys: SharedSelection) => {
      if (typeof keys !== "string") {
        const value = keys.values().next().value;
        if (typeof value === "string") {
          router.replace(
            `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
            { locale: value },
          );
        }
      }
    },
    [router, pathname, searchParams],
  );

  return (
    <Select
      className="w-28"
      selectedKeys={[locale]}
      aria-label={t("LanguageSelect.ariaLabel")}
      variant="bordered"
      size="sm"
      onSelectionChange={updateLocale}
    >
      <SelectItem key="en">{t("LanguageSelect.option.en")}</SelectItem>
      <SelectItem key="de">{t("LanguageSelect.option.de")}</SelectItem>
    </Select>
  );
};
