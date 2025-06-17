import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { MdClose, MdRemoveRedEye } from "react-icons/md";

import { DetailPanelActionButton } from "@/app/[locale]/(authenticated)/components/detail-panel-action-button";
import { DetailPanelActions } from "@/app/[locale]/(authenticated)/components/detail-panel-actions";
import { DetailsPanel } from "@/app/[locale]/(authenticated)/components/details-panel";
import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { EvaluationGeneralInformation } from "@/app/[locale]/(authenticated)/eval/components/evaluation-general-information";
import { EvaluationDetailSummary } from "@/app/client";
import { Link, useRouter } from "@/i18n/routing";

export type EvaluationInformationPanelProps = {
  evaluation: EvaluationDetailSummary;
  disableRemove?: boolean;
  selectedEvaluationIds: string[];
};

export const EvaluationInformationPanel: React.FC<
  EvaluationInformationPanelProps
> = ({ evaluation, disableRemove, selectedEvaluationIds }) => {
  const t = useTranslations();
  const router = useRouter();

  const onRemove = useCallback(() => {
    const newSelection = selectedEvaluationIds.filter(
      (evaluationId) => evaluationId !== evaluation.id,
    );

    const url = evaluationComparePage(newSelection).href;

    router.push(url);
  }, [evaluation.id, selectedEvaluationIds, router]);

  return (
    <DetailsPanel
      className="min-w-[500px]"
      title={evaluation.name}
      titleEnd={
        <DetailPanelActions>
          <DetailPanelActionButton
            aria-label={t(
              "EvaluationInformationPanel.detailsButton.ariaLabel",
              { name: evaluation.name },
            )}
            icon={MdRemoveRedEye}
            href={evaluationPage({ evaluationId: evaluation.id }).href}
            as={Link}
            tooltip={t("EvaluationInformationPanel.detailsButton.tooltip")}
          />
          <DetailPanelActionButton
            aria-label={t("EvaluationInformationPanel.remove.ariaLabel", {
              name: evaluation.name,
            })}
            icon={MdClose}
            tooltip={t("EvaluationInformationPanel.remove.tooltip")}
            onPress={onRemove}
            isDisabled={disableRemove}
          />
        </DetailPanelActions>
      }
    >
      <EvaluationGeneralInformation evaluation={evaluation} />
    </DetailsPanel>
  );
};
