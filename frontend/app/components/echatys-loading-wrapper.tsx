import { Spinner } from "@heroui/react";
import { cx } from "classix";
import React, { PropsWithChildren } from "react";

export type EChartsLoadingWrapperProps = PropsWithChildren<{
  className?: string;
  loading?: boolean;
}>;

export const EChartsLoadingWrapper: React.FC<EChartsLoadingWrapperProps> = ({
  className,
  loading,
  children,
}) => {
  return (
    <div className={cx("relative", className)}>
      {loading && (
        <div className="flex items-center justify-center absolute top-0 left-0 w-full h-full z-[100]">
          <Spinner color="secondary" />
        </div>
      )}

      <div className={cx("w-full", "h-full", loading && "invisible")}>
        {children}
      </div>
    </div>
  );
};
