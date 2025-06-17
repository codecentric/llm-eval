import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import {
  ALL_METRICS_QUERY_BASE_KEY,
  METRIC_QUERY_BASE_KEY,
  METRICS_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/metrics/queries";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";
import { Metric, MetricDelete, metricsDelete } from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";

export type UseMetricDeleteProps = {
  onSuccess?: (result: { message: string }) => void | Promise<void>;
};

export type UseMetricDelete = {
  delete: (metric: Metric) => void;
};

export const useMetricDelete = ({
  onSuccess,
}: UseMetricDeleteProps): UseMetricDelete => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { showConfirmDialog, okFunction } = useConfirmDialog();

  const { mutateAsync: invokeDelete } = useMutation({
    mutationKey: ["deleteMetric"],
    mutationFn: ({
      metricId,
      deleteData,
    }: {
      metricId: string;
      deleteData: MetricDelete;
    }) =>
      callApi(metricsDelete<true>, {
        path: { metric_id: metricId },
        body: deleteData,
      }),
    onSuccess: async (_, { metricId }) => {
      await onSuccess?.({ message: t("useMetricDelete.delete.success") });

      await queryClient.invalidateQueries({
        queryKey: [METRICS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [ALL_METRICS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [METRIC_QUERY_BASE_KEY, metricId],
      });
    },
  });

  const triggerDelete = useCallback(
    (metric: Metric) => {
      showConfirmDialog({
        header: t("useMetricDelete.deleteDialog.header"),
        description: t("useMetricDelete.deleteDialog.description", {
          name: metric.configuration.name,
        }),
        okButtonColor: "danger",
        showLoading: true,
        okButtonLabel: t("useMetricDelete.deleteDialog.okButton"),
        onCancel: () => {},
        onOk: okFunction(() =>
          invokeDelete({
            metricId: metric.id,
            deleteData: {
              version: metric.version,
            },
          }),
        ),
      });
    },
    [showConfirmDialog, t, invokeDelete, okFunction],
  );

  return {
    delete: triggerDelete,
  };
};
