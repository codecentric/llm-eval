import { ButtonProps, ModalProps } from "@heroui/react";
import { useTranslations } from "next-intl";
import { createContext, ReactNode } from "react";

import {
  AppModal,
  AppModalBody,
  AppModalCancelButton,
  AppModalFooter,
  AppModalHeader,
  AppModalPrimaryButton,
} from "@/app/components/modal";

import { ErrorDisplay } from "./error-display";

import type { ResponseError } from "@/app/utils/backend-client/exception-handler";

export type ConfirmDialogError = string | ResponseError;

export type OkFunctionResult = void | { error?: ConfirmDialogError };

export type OkFunction =
  | (() => Promise<OkFunctionResult>)
  | (() => OkFunctionResult);

export type ConfirmDialogConfig = {
  header: ReactNode;
  description: ReactNode;
  cancelButtonLabel?: string;
  okButtonLabel?: string;
  okButtonColor?: ButtonProps["color"];
  size?: ModalProps["size"];
  showLoading?: boolean;
  onCancel?: () => void;
  onOk?: OkFunction;
  noCancel?: boolean;
};

export type ConfirmDialogContext = {
  showConfirmDialog: (config: ConfirmDialogConfig) => void;
};

export const ConfirmDialogContext = createContext<ConfirmDialogContext | null>(
  null,
);

export type ConfirmDialogProps = {
  open?: boolean;
  header: ReactNode;
  description: ReactNode;
  cancelButtonLabel?: string;
  okButtonLabel?: string;
  okButtonColor?: ButtonProps["color"];
  okButtonLoading?: boolean;
  size?: ModalProps["size"];
  error?: ConfirmDialogError;
  errorTitle?: string;
  onCancel: () => void;
  onOk: () => void;
  noCancel?: boolean;
};

export const ConfirmDialog = ({
  open,
  header,
  description,
  cancelButtonLabel,
  okButtonLabel,
  okButtonColor,
  okButtonLoading,
  onOk,
  onCancel,
  size,
  error,
  errorTitle,
  noCancel,
}: ConfirmDialogProps) => {
  const t = useTranslations();
  return (
    <AppModal
      isOpen={open}
      onClose={onCancel}
      size={size ?? "xl"}
      isDismissable={!okButtonLoading && !noCancel}
      hideCloseButton={okButtonLoading || noCancel}
      color={okButtonColor}
    >
      {(onClose) => (
        <>
          <AppModalHeader>{header}</AppModalHeader>
          <AppModalBody>{description}</AppModalBody>
          {error && (
            <AppModalBody>
              <ErrorDisplay
                message={errorTitle || t("ConfirmDialog.errorTitle")}
                error={error}
                classNames={{
                  codeBlock: "max-h-96",
                }}
              />
            </AppModalBody>
          )}
          <AppModalFooter>
            {!noCancel && (
              <AppModalCancelButton
                onPress={onClose}
                isDisabled={okButtonLoading}
              >
                {cancelButtonLabel || t("ConfirmDialog.cancelButton")}
              </AppModalCancelButton>
            )}
            <AppModalPrimaryButton
              color={okButtonColor ?? "primary"}
              onPress={onOk}
              isLoading={okButtonLoading}
            >
              {okButtonLabel || t("ConfirmDialog.okButton")}
            </AppModalPrimaryButton>
          </AppModalFooter>
        </>
      )}
    </AppModal>
  );
};
