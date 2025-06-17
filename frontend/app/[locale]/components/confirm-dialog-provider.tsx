import { useDisclosure } from "@heroui/react";
import { PropsWithChildren, useCallback, useState } from "react";

import {
  ConfirmDialog,
  ConfirmDialogConfig,
  ConfirmDialogContext,
  ConfirmDialogError,
} from "@/app/[locale]/components/confirm-dialog";

export const ConfirmDialogProvider = ({ children }: PropsWithChildren) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dialogConfig, setDialogConfig] = useState<ConfirmDialogConfig>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmDialogError | undefined>(undefined);

  const showConfirmDialog = useCallback(
    (config: ConfirmDialogConfig) => {
      setError(undefined);
      setLoading(false);
      setDialogConfig(config);
      onOpen();
    },
    [onOpen, setDialogConfig],
  );

  const onCancel = useCallback(() => {
    dialogConfig?.onCancel?.();
    onClose();
  }, [onClose, dialogConfig]);

  const onOk = useCallback(async () => {
    if (dialogConfig?.onOk) {
      setLoading(dialogConfig.showLoading ?? false);
      try {
        const okResult = await dialogConfig.onOk();

        if (typeof okResult === "object" && okResult.error) {
          setError(okResult.error);
        } else {
          onClose();
        }
      } finally {
        setLoading(false);
      }
    } else {
      onClose();
    }
  }, [onClose, dialogConfig]);

  const contextValue: ConfirmDialogContext = {
    showConfirmDialog,
  };

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      <>
        {dialogConfig && (
          <ConfirmDialog
            open={isOpen}
            header={dialogConfig.header}
            description={dialogConfig.description}
            cancelButtonLabel={dialogConfig.cancelButtonLabel}
            okButtonLabel={dialogConfig.okButtonLabel}
            okButtonColor={dialogConfig.okButtonColor}
            size={dialogConfig.size}
            onCancel={onCancel}
            onOk={onOk}
            okButtonLoading={loading}
            error={error}
            noCancel={dialogConfig.noCancel}
          />
        )}
        {children}
      </>
    </ConfirmDialogContext.Provider>
  );
};
