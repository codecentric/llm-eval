import { useTranslations } from "next-intl";
import { useCallback, useContext } from "react";

import {
  ConfirmDialogConfig,
  ConfirmDialogContext,
  OkFunction,
} from "@/app/[locale]/components/confirm-dialog";
import { isResponseError } from "@/app/utils/backend-client/exception-handler";

export const useConfirmDialog = () => {
  const t = useTranslations();
  const confirmDialogContext = useContext(ConfirmDialogContext);

  const showConfirmDialog = useCallback(
    (config: ConfirmDialogConfig) => {
      confirmDialogContext?.showConfirmDialog(config);
    },
    [confirmDialogContext],
  );

  const okFunction = useCallback(
    (fn: () => Promise<unknown> | unknown): OkFunction =>
      async () => {
        try {
          await fn();
        } catch (e) {
          if (isResponseError(e)) {
            return { error: e };
          } else if (e instanceof Error) {
            return { error: e.message };
          } else {
            return { error: t("unknownError") };
          }
        }
      },
    [t],
  );

  return {
    showConfirmDialog,
    okFunction,
  };
};
