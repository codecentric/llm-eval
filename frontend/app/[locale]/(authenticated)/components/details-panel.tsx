import { Card, CardBody, CardHeader } from "@heroui/react";
import React, { PropsWithChildren, ReactNode } from "react";

export type DetailsPanelProps = PropsWithChildren<{
  title: string;
  titleEnd?: ReactNode;
  variant?: "light" | "card";
  className?: string;
  classNames?: { content: string };
  style?: React.CSSProperties;
}>;

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  title,
  titleEnd,
  children,
  variant = "card",
  className,
  classNames,
  style,
}) => {
  return variant === "light" ? (
    <div className={className} role="region" aria-label={title} style={style}>
      <div className="flex items-start gap-4 pb-2">
        <div className="text-sm font-bold text-secondary pb-0.5">{title}</div>
        <div className="flex-1 flex justify-end">{titleEnd}</div>
      </div>
      <div className={classNames?.content}>{children}</div>
    </div>
  ) : (
    <Card className={className} role="region" aria-label={title} style={style}>
      <CardHeader className="flex items-start gap-4">
        <div className="text-medium text-secondary font-bold">{title}</div>
        <div className="flex-1 flex justify-end">{titleEnd}</div>
      </CardHeader>
      <CardBody className="h-full">{children}</CardBody>
    </Card>
  );
};
