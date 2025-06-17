import { cx } from "classix";
import React, { ReactNode } from "react";

export type NameValueGridItem = {
  key: string;
  name: ReactNode;
  value: ReactNode;
};

export type NameValueGridProps = {
  className?: string;
  items: NameValueGridItem[];
};

export const NameValueGrid: React.FC<NameValueGridProps> = ({
  items,
  className,
}) => {
  return (
    <div
      className={cx(
        "grid grid-cols-[auto_auto] gap-y-2 gap-x-4 text-small",
        className,
      )}
    >
      {items.map(({ key, name, value }) => (
        <React.Fragment key={key}>
          <div className="font-bold">{name}</div>
          <div>{value}</div>
        </React.Fragment>
      ))}
    </div>
  );
};
