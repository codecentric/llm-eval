import { Button, ButtonProps, Tooltip } from "@heroui/react";
import { IconType } from "react-icons";

import { Link } from "@/i18n/routing";

export type PageActionProps = Omit<ButtonProps, "variant"> & {
  icon: IconType;
  text?: string;
  inlineText?: boolean;
  asLink?: boolean;
  role?: string;
};

export const PageAction = ({
  icon: Icon,
  text,
  color,
  inlineText,
  asLink,
  href,
  role,
  ...buttonProps
}: PageActionProps) => {
  if (!asLink && href) {
    throw new Error("Cannot use href w/o asLink");
  }
  return (
    <Tooltip
      content={text}
      placement="bottom"
      isDisabled={inlineText}
      color={color ?? "primary"}
      role={role}
    >
      <Button
        variant="bordered"
        isIconOnly={!inlineText}
        color={color ?? "primary"}
        aria-label={text}
        startContent={inlineText ? <Icon size={24} /> : undefined}
        {...(asLink && href ? { as: Link, href: href } : {})}
        {...buttonProps}
      >
        {inlineText ? text : <Icon size={24} />}
      </Button>
    </Tooltip>
  );
};
