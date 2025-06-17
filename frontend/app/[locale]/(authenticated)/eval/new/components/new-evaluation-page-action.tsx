import { useTranslations } from "next-intl";
import { MdPlayArrow } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { newEvaluationPage } from "@/app/[locale]/(authenticated)/eval/new/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";

export type NewEvaluationPageActionProps = {
  inlineText?: boolean;
  catalogId?: string;
  origin?: StartEvalOrigin;
};

export const NewEvaluationPageAction = ({
  inlineText,
  catalogId,
  origin,
}: NewEvaluationPageActionProps) => {
  const t = useTranslations();

  return (
    <PageAction
      icon={MdPlayArrow}
      text={t("NewEvaluationPageAction.text")}
      inlineText={inlineText}
      href={newEvaluationPage({ catalogId, origin }).href}
      asLink
    />
  );
};
