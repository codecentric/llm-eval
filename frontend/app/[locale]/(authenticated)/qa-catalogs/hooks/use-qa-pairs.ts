import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { NewQaPair, qaCatalogEditQaCatalog, QaPair } from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";
import { useRouter } from "@/i18n/routing";

export type PendingChange =
  | { type: "edit"; data: QaPair }
  | { type: "add"; data: NewQaPair }
  | { type: "delete"; data: { id: string } };

export type CatalogChanges = {
  updates: QaPair[];
  additions: NewQaPair[];
  deletions: string[];
};

export function useQaPairs(catalogId: string) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, PendingChange>
  >({});

  const editQaCatalogMutation = useMutation({
    mutationFn: (changes: CatalogChanges) =>
      callApi(qaCatalogEditQaCatalog<true>, {
        path: { catalog_id: catalogId },
        body: changes,
      }),
    onSuccess: (qaCatalog) => {
      setPendingChanges({});
      addToast({
        title: t("QACatalogPage.changesSaved"),
        color: "success",
      });

      // Navigate to the new route only if the API returns valid data
      if (qaCatalog?.id && qaCatalog?.name) {
        const newRoute = qaCatalogDetailPage(qaCatalog.id, qaCatalog.name).href;
        router.replace(newRoute);
      }

      queryClient.invalidateQueries({ queryKey: ["qaCatalog", catalogId] });
    },
    onError: (error) => {
      console.error("Failed to save catalog changes:", error);
      addToast({
        title: t("QACatalogPage.saveError"),
        color: "danger",
      });
    },
  });

  const handleEdit = useCallback((qaPair: QaPair) => {
    setPendingChanges((prev) => {
      if (prev[qaPair.id]?.type === "add") {
        return {
          ...prev,
          [qaPair.id]: { type: "add", data: qaPair },
        };
      }
      return {
        ...prev,
        [qaPair.id]: { type: "edit", data: qaPair },
      };
    });
  }, []);

  const handleAdd = useCallback((newQAPair: NewQaPair) => {
    const tempId = `temp-${Date.now()}`;
    setPendingChanges((prev) => ({
      ...prev,
      [tempId]: { type: "add", data: newQAPair },
    }));
  }, []);

  const handleDelete = useCallback((rowId: string) => {
    setPendingChanges((prev) => {
      if (prev[rowId]?.type === "add") {
        return Object.fromEntries(
          Object.entries(prev).filter(([id]) => id !== rowId),
        );
      }
      return {
        ...prev,
        [rowId]: { type: "delete", data: { id: rowId } },
      };
    });
  }, []);

  const handleUndo = useCallback((rowId: string) => {
    setPendingChanges((prev) => {
      return Object.fromEntries(
        Object.entries(prev).filter(([id]) => id !== rowId),
      );
    });
  }, []);
  const handleSaveAll = useCallback(async () => {
    const changes: CatalogChanges = {
      updates: [],
      additions: [],
      deletions: [],
    };

    Object.entries(pendingChanges).forEach(([id, change]) => {
      switch (change.type) {
        case "edit":
          changes.updates.push(change.data); // todo i think edit is not working anymore
          break;
        case "add":
          changes.additions.push(change.data);
          break;
        case "delete":
          changes.deletions.push(id);
          break;
      }
    });
    console.log(changes);
    if (
      changes.updates.length ||
      changes.additions.length ||
      changes.deletions.length
    ) {
      await editQaCatalogMutation.mutateAsync(changes);
    }
  }, [pendingChanges, editQaCatalogMutation]);

  const handleCancelAll = useCallback(() => {
    setPendingChanges({});
  }, []);

  const hasPendingChanges = useMemo(() => {
    return Object.keys(pendingChanges).length > 0;
  }, [pendingChanges]);

  const pendingChangesCount = useMemo(() => {
    return Object.keys(pendingChanges).length;
  }, [pendingChanges]);

  return {
    pendingChanges,
    handleEdit,
    handleAdd,
    handleDelete,
    handleUndo,
    handleSaveAll,
    handleCancelAll,
    hasPendingChanges,
    pendingChangesCount,
  };
}
