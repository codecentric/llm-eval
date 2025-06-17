"use client";

import { useTranslations } from "next-intl";

import { QaCatalogStatus } from "@/app/client";
import { StatusChip, StatusChipProps } from "@/app/components/status-chip";
import { useRecursiveTimeout } from "@/app/hooks/use-recursive-timeout";

export type QACatalogStatusChipProps = {
  status: QaCatalogStatus;
  onUpdate?: () => Promise<unknown> | unknown;
  updateInterval?: number;
} & Pick<StatusChipProps, "size">;

export const QACatalogStatusChip = ({
  status,
  size,
  onUpdate,
  updateInterval = 3000,
}: QACatalogStatusChipProps) => {
  const t = useTranslations();

  useRecursiveTimeout(
    updateInterval,
    onUpdate,
    status === QaCatalogStatus.FAILURE || status === QaCatalogStatus.READY,
  );

  const statusProps: StatusChipProps = {
    size,
  };

  switch (status) {
    case QaCatalogStatus.GENERATING:
      statusProps.color = "secondary";
      statusProps.showSpinner = true;
      break;
    case QaCatalogStatus.READY:
      statusProps.color = "success";
      break;
    case QaCatalogStatus.FAILURE:
      statusProps.color = "danger";
      break;
  }

  return (
    <StatusChip {...statusProps}>
      {t(`qaCatalogGenerationStatus.${status}`)}
    </StatusChip>
  );
};
