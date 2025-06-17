import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import {
  EVALUATION_QUERY_BASE_KEY,
  EVALUATION_SUMMARY_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { EVALUATIONS_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/eval/queries";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";
import { EvaluationDelete, evaluationsDelete } from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";

export type DeleteEvaluation = {
  id: string;
  name: string;
  version: number;
};

export type UseEvaluationDeleteProps = {
  onSuccess?: (result: { message: string }) => void | Promise<void>;
};

export type UseEvaluationDelete = {
  delete: (evaluation: DeleteEvaluation) => void;
};

export const useEvaluationDelete = ({
  onSuccess,
}: UseEvaluationDeleteProps): UseEvaluationDelete => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { showConfirmDialog, okFunction } = useConfirmDialog();

  const { mutateAsync: invokeDelete } = useMutation({
    mutationKey: ["deleteEvaluation"],
    mutationFn: ({
      evaluationId,
      deleteData,
    }: {
      evaluationId: string;
      deleteData: EvaluationDelete;
    }) =>
      callApi(evaluationsDelete<true>, {
        path: { evaluation_id: evaluationId },
        body: deleteData,
      }),
    onSuccess: async (_, { evaluationId }) => {
      await onSuccess?.({ message: t("useEvaluationDelete.delete.success") });

      await queryClient.invalidateQueries({
        queryKey: [EVALUATIONS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [EVALUATION_QUERY_BASE_KEY, evaluationId],
      });
      await queryClient.invalidateQueries({
        queryKey: [EVALUATION_SUMMARY_QUERY_BASE_KEY, evaluationId],
      });
    },
  });

  const triggerDelete = useCallback(
    (evaluation: DeleteEvaluation) => {
      showConfirmDialog({
        header: t("useEvaluationDelete.deleteDialog.header"),
        description: t("useEvaluationDelete.deleteDialog.description", {
          name: evaluation.name,
        }),
        okButtonColor: "danger",
        showLoading: true,
        okButtonLabel: t("useEvaluationDelete.deleteDialog.okButton"),
        onCancel: () => {},
        onOk: okFunction(() =>
          invokeDelete({
            evaluationId: evaluation.id,
            deleteData: {
              version: evaluation.version,
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
