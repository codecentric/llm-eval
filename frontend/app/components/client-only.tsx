import dynamic from "next/dynamic";
import React from "react";

const ClientOnlyInternal: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return children;
};

export const ClientOnly = dynamic(() => Promise.resolve(ClientOnlyInternal), {
  ssr: false,
});
