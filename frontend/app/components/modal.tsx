import {
  Button,
  ButtonProps,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Popover,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
} from "@heroui/react";
import { cx } from "classix";
import React, { createContext, PropsWithChildren, useContext } from "react";
import { MdClose } from "react-icons/md";

import { DetailPanelActionButton } from "@/app/[locale]/(authenticated)/components/detail-panel-action-button";

type AppModalContext = {
  isPopover?: boolean;
};

const AppModalContext = createContext<AppModalContext>({});

type AppModalProviderProps = PropsWithChildren<{ isPopover?: boolean }>;

const AppModalProvider: React.FC<AppModalProviderProps> = ({
  children,
  isPopover,
}) => {
  return (
    <AppModalContext.Provider value={{ isPopover }}>
      {children}
    </AppModalContext.Provider>
  );
};

const useAppModal = () => {
  const context = useContext(AppModalContext);

  return context;
};

export type AppModalButtonProps = Pick<
  ButtonProps,
  | "startContent"
  | "endContent"
  | "children"
  | "color"
  | "onPress"
  | "href"
  | "as"
  | "isDisabled"
  | "type"
  | "form"
  | "isLoading"
>;

export const AppModalPrimaryButton: React.FC<AppModalButtonProps> = (props) => {
  return <Button color="primary" {...props} />;
};

export const AppModalCancelButton: React.FC<AppModalButtonProps> = (props) => {
  return <Button {...props} color="primary" variant="light" />;
};

export type AppModalHeaderProps = PropsWithChildren<{
  className?: string;
  tabIndex?: number;
}>;

export const AppModalHeader: React.FC<AppModalHeaderProps> = ({
  children,
  className,
  tabIndex,
}) => {
  const { isPopover } = useAppModal();

  return isPopover ? (
    <CardHeader
      className={cx("font-bold text-secondary", className)}
      tabIndex={tabIndex}
    >
      {children}
    </CardHeader>
  ) : (
    <ModalHeader
      className={cx("text-secondary", className)}
      tabIndex={tabIndex}
    >
      {children}
    </ModalHeader>
  );
};

export type AppModalBodyProps = PropsWithChildren<{
  className?: string;
  tabIndex?: number;
}>;

export const AppModalBody: React.FC<AppModalBodyProps> = ({
  children,
  className,
  tabIndex,
}) => {
  const { isPopover } = useAppModal();

  return isPopover ? (
    <CardBody className={className} tabIndex={tabIndex}>
      {children}
    </CardBody>
  ) : (
    <ModalBody className={className} tabIndex={tabIndex}>
      {children}
    </ModalBody>
  );
};

export type AppModalFooterProps = PropsWithChildren<{
  className?: string;
  tabIndex?: number;
}>;

export const AppModalFooter: React.FC<AppModalFooterProps> = ({
  children,
  className,
  tabIndex,
}) => {
  const { isPopover } = useAppModal();

  return isPopover ? (
    <CardFooter
      className={cx("flex-col items-stretch pt-0", className)}
      tabIndex={tabIndex}
    >
      <Divider className="mb-3" />
      <div className="flex justify-end gap-2">{children}</div>
    </CardFooter>
  ) : (
    <ModalFooter className={className} tabIndex={tabIndex}>
      {children}
    </ModalFooter>
  );
};

const sizeToWidth = (size: ModalProps["size"]) => {
  let width = "";

  switch (size) {
    case "xs":
      width = "w-[20rem]";
      break;
    case "sm":
      width = "w-[24rem]";
      break;
    case "md":
      width = "w-[28rem]";
      break;
    case "lg":
      width = "w-[32rem]";
      break;
    case "xl":
      width = "w-[36rem]";
      break;
    case "2xl":
      width = "w-[42rem]";
      break;
    case "3xl":
      width = "w-[48rem]";
      break;
    case "4xl":
      width = "w-[56rem]";
      break;
    case "5xl":
      width = "w-[64rem]";
      break;
    case "full":
      width = "w-full";
      break;
  }

  return width;
};

const getColorClasses = (color: ButtonProps["color"]) => {
  switch (color) {
    case "primary":
      return {
        beforeBackground: "before:bg-primary",
        border: "border-primary",
      };
    case "secondary":
      return {
        beforeBackground: "before:bg-secondary",
        border: "border-secondary",
      };
    case "success":
      return {
        beforeBackground: "before:bg-success",
        border: "border-success",
      };
    case "warning":
      return {
        beforeBackground: "before:bg-warning",
        border: "border-warning",
      };
    case "danger":
      return {
        beforeBackground: "before:bg-danger",
        border: "border-danger",
      };
    default:
      return {
        beforeBackground: "before:bg-default",
        border: "border-default",
      };
  }
};

type AppModalSharedProps = {
  color?: ButtonProps["color"];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  children: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  "aria-label"?: string;
} & Pick<ModalProps, "size">;

export type AppModalPopoverProps = AppModalSharedProps & {
  isPopover: true;
  trigger: React.ReactNode;
} & Pick<PopoverProps, "placement">;

export type AppModalModalProps = AppModalSharedProps & {
  isPopover?: false;
  trigger?: React.ReactNode;
} & Pick<ModalProps, "isDismissable" | "hideCloseButton">;

export type AppModalProps = AppModalPopoverProps | AppModalModalProps;

export const AppModal: React.FC<AppModalProps> = (props) => {
  if (props.isPopover) {
    const {
      isPopover,
      children,
      trigger,
      onOpenChange,
      "aria-label": ariaLabel,
      color = "primary",
      size,
      onClose,
      ...popoverProps
    } = props;

    const width = sizeToWidth(size);
    const colorClasses = getColorClasses(color);

    return (
      <AppModalProvider isPopover={isPopover}>
        <Popover
          onOpenChange={onOpenChange}
          placement="bottom-end"
          showArrow={true}
          backdrop="opaque"
          onClick={(e) => {
            if ((e.target as HTMLElement).dataset.slot === "backdrop") {
              if (onClose) {
                onClose();
              } else {
                onOpenChange?.(false);
              }
            }
          }}
          classNames={{
            base: [
              // arrow color
              colorClasses.beforeBackground,
            ],
            content: ["border-2", colorClasses.border],
          }}
          {...popoverProps}
        >
          <PopoverTrigger>{trigger}</PopoverTrigger>
          <PopoverContent className={cx("p-0", width)} aria-label={ariaLabel}>
            <Card className="border-none bg-transparent w-full" shadow="none">
              {typeof children === "function"
                ? children(onClose ?? (() => onOpenChange?.(false)))
                : children}
            </Card>
          </PopoverContent>
        </Popover>
      </AppModalProvider>
    );
  } else {
    const {
      isPopover,
      children,
      trigger,
      "aria-label": ariaLabel,
      color = "primary",
      ...modalProps
    } = props;

    const colorClasses = getColorClasses(color);

    return (
      <AppModalProvider isPopover={isPopover}>
        {trigger}
        <Modal
          {...modalProps}
          classNames={{
            base: ["border-2", colorClasses.border],
            closeButton: ["text-primary"],
          }}
          closeButton={
            <DetailPanelActionButton icon={MdClose} color="primary" />
          }
        >
          <ModalContent aria-label={ariaLabel}>{children}</ModalContent>
        </Modal>
      </AppModalProvider>
    );
  }
};
