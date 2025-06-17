"use client";

import { cx } from "classix";
import { useAtom } from "jotai";
import { PropsWithChildren, ReactNode, useMemo } from "react";

import { PageHeader } from "@/app/[locale]/(authenticated)/components/page-header";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { showContextHelpAtom } from "@/app/state/context-help";

import { ContextHelp } from "./context-help";

export type PageContentProps = PropsWithChildren<{
  pageInfo: PageInfo;
  actions?: ReactNode[];
  titleEnd?: ReactNode;
  helpPage?: ReactNode;
  noPadding?: boolean;
}>;

export const PageContent = ({
  children,
  actions,
  pageInfo,
  titleEnd,
  helpPage,
  noPadding,
}: PageContentProps) => {
  const [showContextHelp] = useAtom(showContextHelpAtom);

  const hasHelpPage = !!helpPage;
  const showHelpPage = useMemo(
    () => hasHelpPage && showContextHelp,
    [hasHelpPage, showContextHelp],
  );

  return (
    <div className="grid grid-cols-2 grid-rows-[auto_minmax(0,_1fr)] grid-cols-[auto_450px]">
      <PageHeader
        className="pl-4 col-span-2"
        pageInfo={pageInfo}
        actions={actions}
        titleEnd={titleEnd}
        hasContextHelp={hasHelpPage}
      />

      <main
        className={cx(
          "overflow-auto",
          !noPadding && "p-4",
          !showHelpPage && "col-span-2",
        )}
      >
        {children}
      </main>

      {showHelpPage && (
        <ContextHelp className="my-4 mr-4">{helpPage}</ContextHelp>
      )}
    </div>
  );
};
