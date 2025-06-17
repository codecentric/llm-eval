import { Button, ButtonProps, Tooltip } from "@heroui/react";
import { ReactNode } from "react";
import { IconType } from "react-icons";

export type DetailPanelActionButtonProps = Omit<ButtonProps, "children"> & {
  tooltip?: ReactNode;
  icon: IconType;
};

export const DetailPanelActionButton: React.FC<
  DetailPanelActionButtonProps
> = ({ tooltip, icon: Icon, ...buttonProps }) => {
  const button = (
    <Button
      color="primary"
      {...buttonProps}
      variant="light"
      size="sm"
      radius="full"
      isIconOnly
    >
      <Icon size={20} />
    </Button>
  );

  return tooltip ? (
    <Tooltip content={tooltip} color={buttonProps.color ?? "primary"}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};
