import React, { PropsWithChildren } from "react";

export const DetailPanelActions: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <div className="-mt-2 -mr-2">{children}</div>;
};
