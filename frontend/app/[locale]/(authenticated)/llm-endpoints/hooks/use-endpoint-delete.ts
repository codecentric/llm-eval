import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import {
  LLM_ENDPOINT_QUERY_BASE_KEY,
  LLM_ENDPOINTS_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";
import {
  LlmEndpoint,
  LlmEndpointDelete,
  llmEndpointsDelete,
} from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";

export type UseEndpointDeleteProps = {
  onSuccess?: (result: { message: string }) => void | Promise<void>;
};

export type UseEndpointDelete = {
  delete: (endpoint: LlmEndpoint) => void;
};

export const useEndpointDelete = ({
  onSuccess,
}: UseEndpointDeleteProps): UseEndpointDelete => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { showConfirmDialog, okFunction } = useConfirmDialog();

  const { mutateAsync: deleteEndpoint } = useMutation({
    mutationKey: ["deleteLlmEndpoint"],
    mutationFn: ({
      endpointId,
      deleteData,
    }: {
      endpointId: string;
      deleteData: LlmEndpointDelete;
    }) =>
      callApi(llmEndpointsDelete<true>, {
        path: { llm_endpoint_id: endpointId },
        body: deleteData,
      }),
    onSuccess: async (_, { endpointId }) => {
      await queryClient.invalidateQueries({
        queryKey: [LLM_ENDPOINTS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [LLM_ENDPOINT_QUERY_BASE_KEY, endpointId],
      });

      await onSuccess?.({ message: t("useEndpointDelete.delete.success") });
    },
  });

  const triggerDelete = useCallback(
    (endpoint: LlmEndpoint) => {
      showConfirmDialog({
        header: t("useEndpointDelete.deleteDialog.header"),
        description: t("useEndpointDelete.deleteDialog.description", {
          name: endpoint.name,
        }),
        okButtonColor: "danger",
        showLoading: true,
        okButtonLabel: t("useEndpointDelete.deleteDialog.okButton"),
        onCancel: () => {},
        onOk: okFunction(() =>
          deleteEndpoint({
            endpointId: endpoint.id,
            deleteData: {
              version: endpoint.version,
            },
          }),
        ),
      });
    },
    [showConfirmDialog, t, deleteEndpoint, okFunction],
  );

  return {
    delete: triggerDelete,
  };
};
