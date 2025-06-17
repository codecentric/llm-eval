import { useTranslations } from "next-intl";
import React, { PropsWithChildren, useCallback, useState } from "react";

import { evaluationComparePage } from "@/app/[locale]/(authenticated)/eval/compare/page-info";
import { EvaluationStatus, GetAllEvaluationResult } from "@/app/client";
import {
  AppModal,
  AppModalBody,
  AppModalCancelButton,
  AppModalFooter,
  AppModalHeader,
  AppModalPrimaryButton,
  AppModalProps,
} from "@/app/components/modal";
import { useRouter } from "@/i18n/routing";

import { EvaluationSelection } from "./evaluation-selection";

type EvaluationSelectionPopoverContentProps = {
  currentSelection: string[];
  onClose: () => void;
};

const EvaluationSelectionPopoverContent: React.FC<
  EvaluationSelectionPopoverContentProps
> = ({ onClose, currentSelection }) => {
  const t = useTranslations();
  const router = useRouter();

  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);

  const addEvaluations = useCallback(() => {
    onClose();

    router.push(
      evaluationComparePage([...currentSelection, ...selectedEvaluations]).href,
    );
  }, [currentSelection, router, selectedEvaluations, onClose]);

  const allowSelection = useCallback(
    (evaluation: GetAllEvaluationResult) =>
      !currentSelection.includes(evaluation.id) &&
      evaluation.status === EvaluationStatus.SUCCESS,
    [currentSelection],
  );

  return (
    <>
      <AppModalHeader>
        {t("EvaluationSelectionPopoverContent.title")}
      </AppModalHeader>
      <AppModalBody className="relative">
        <EvaluationSelection
          onSelectionChange={setSelectedEvaluations}
          allowSelection={allowSelection}
        />
      </AppModalBody>
      <AppModalFooter>
        <AppModalCancelButton onPress={onClose}>
          {t("EvaluationSelectionPopoverContent.cancel")}
        </AppModalCancelButton>
        <AppModalPrimaryButton
          onPress={addEvaluations}
          isDisabled={!selectedEvaluations.length}
        >
          {t("EvaluationSelectionPopoverContent.add")}
        </AppModalPrimaryButton>
      </AppModalFooter>
    </>
  );
};

export type EvaluationSelectionPopoverProps = PropsWithChildren<{
  currentSelection: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  color?: AppModalProps["color"];
}>;

export const EvaluationSelectionPopover: React.FC<
  EvaluationSelectionPopoverProps
> = ({ children, isOpen, onOpenChange, currentSelection, color }) => {
  const t = useTranslations();

  return (
    <AppModal
      isPopover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={children}
      color={color}
      aria-label={t("EvaluationSelectionPopover.dialog.ariaLabel")}
      size="3xl"
    >
      {(onClose) => (
        <EvaluationSelectionPopoverContent
          currentSelection={currentSelection}
          onClose={onClose}
        />
      )}
    </AppModal>
  );
};
