import { useTranslations } from "next-intl";

import { EvaluationStatus, TestCaseProgress } from "@/app/client";
import { StatusChip, StatusChipProps } from "@/app/components/status-chip";
import { useRecursiveTimeout } from "@/app/hooks/use-recursive-timeout";

export type EvaluationStatusChipProps = {
  status: EvaluationStatus;
  progress?: TestCaseProgress;
  onUpdate?: () => Promise<unknown> | unknown;
  updateInterval?: number;
} & Pick<StatusChipProps, "size">;

export const EvaluationStatusChip = ({
  status,
  size,
  progress,
  onUpdate,
  updateInterval = 3000,
}: EvaluationStatusChipProps) => {
  const t = useTranslations();

  useRecursiveTimeout(
    updateInterval,
    onUpdate,
    status === EvaluationStatus.FAILURE || status === EvaluationStatus.SUCCESS,
  );

  const statusProps: StatusChipProps = {
    size,
  };

  switch (status) {
    case EvaluationStatus.PENDING:
    case EvaluationStatus.RUNNING:
      statusProps.endContent = progress ? (
        <div className="ml-1 text-inherit font-bold">{`${progress.done} / ${progress.total}`}</div>
      ) : undefined;
      statusProps.color = "secondary";
      statusProps.showSpinner = true;
      break;
    case EvaluationStatus.SUCCESS:
      statusProps.color = "success";
      break;
    case EvaluationStatus.FAILURE:
      statusProps.color = "danger";
      break;
  }

  return (
    <StatusChip {...statusProps}>{t(`evaluationStatus.${status}`)}</StatusChip>
  );
};
