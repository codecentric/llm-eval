import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { QA_CATALOG_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/queries";
import { QA_CATALOGS_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";
import { QaCatalog, qaCatalogDelete } from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";

export type UseQaCatalogDeleteProps = {
  onSuccess?: (result: { message: string }) => void | Promise<void>;
};

export type UseQaCatalogDelete = {
  delete: (qaCatalog: Pick<QaCatalog, "id" | "name">) => void;
};

export const useQaCatalogDelete = ({
  onSuccess,
}: UseQaCatalogDeleteProps): UseQaCatalogDelete => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { showConfirmDialog, okFunction } = useConfirmDialog();

  const { mutateAsync: deleteCatalog } = useMutation({
    mutationKey: ["deleteQaCatalog"],
    mutationFn: ({ catalogId }: { catalogId: string }) =>
      callApi(qaCatalogDelete<true>, {
        path: { catalog_id: catalogId },
      }),
    onSuccess: async (_, { catalogId }) => {
      await queryClient.invalidateQueries({
        queryKey: [QA_CATALOGS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [QA_CATALOG_QUERY_BASE_KEY, catalogId],
      });

      await onSuccess?.({ message: t("useQaCatalogDelete.delete.success") });
    },
  });

  const triggerDelete = useCallback(
    (qaCatalog: Pick<QaCatalog, "id" | "name">) => {
      showConfirmDialog({
        header: t("useQaCatalogDelete.deleteDialog.header"),
        description: t("useQaCatalogDelete.deleteDialog.description", {
          name: qaCatalog.name,
        }),
        okButtonColor: "danger",
        showLoading: true,
        okButtonLabel: t("useQaCatalogDelete.deleteDialog.okButton"),
        onCancel: () => {},
        onOk: okFunction(() =>
          deleteCatalog({
            catalogId: qaCatalog.id,
          }),
        ),
      });
    },
    [showConfirmDialog, t, deleteCatalog, okFunction],
  );

  return {
    delete: triggerDelete,
  };
};
