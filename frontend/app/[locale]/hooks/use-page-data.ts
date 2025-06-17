import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { PageData, PageDataType } from "@/app/types/page-data";

export const usePageData = <Data>(
  data?: Data,
  error?: unknown,
): PageData<Data> => {
  const t = useTranslations();

  return useMemo(
    () =>
      error
        ? {
            type: PageDataType.ERROR,
            error,
          }
        : data
          ? { type: PageDataType.DATA, data }
          : { type: PageDataType.ERROR, error: t("DetailsPage.noData") },
    [data, error, t],
  );
};
