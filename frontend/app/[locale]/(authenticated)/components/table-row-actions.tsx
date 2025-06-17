import { Button, ButtonProps, Tooltip } from "@heroui/react";
import { IconType } from "react-icons";

import { Link } from "@/i18n/routing";

export type TableRowAction = ButtonProps & {
  icon: IconType;
  tooltip: string;
};

const TableRowActionsItem = ({
  icon: Icon,
  tooltip,
  ...buttonProps
}: TableRowAction) => {
  const buttonParams: ButtonProps = {
    ...buttonProps,
    isIconOnly: true,
    variant: buttonProps.variant ?? "light",
    color: buttonProps.color ?? "primary",
    size: buttonProps.size ?? "sm",
  };

  if (buttonParams.href) {
    buttonParams.as = Link;
  }

  return (
    <Tooltip
      content={tooltip}
      closeDelay={0}
      color={buttonParams.color}
      disableAnimation
    >
      <Button {...buttonParams}>
        <Icon size={20} />
      </Button>
    </Tooltip>
  );
};

export type TableRowActionsProps = {
  actions: TableRowAction[];
};

export const TableRowActions = ({ actions }: TableRowActionsProps) => {
  return (
    <div className="flex items-center justify-start lg:justify-end" role="menu">
      {actions.map((action, index) => (
        <TableRowActionsItem
          role="menuitem"
          key={index}
          {...action}
          aria-label={action.tooltip}
        />
      ))}
    </div>
  );
};
