import { useTranslations } from "next-intl";

export type YesNoProps = {
  value?: boolean;
};

export const YesNo = ({ value }: YesNoProps) => {
  const t = useTranslations();

  return value ? t("YesNo.yes") : t("YesNo.no");
};
