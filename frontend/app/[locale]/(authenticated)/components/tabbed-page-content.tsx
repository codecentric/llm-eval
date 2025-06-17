"use client";

import { Tab, Tabs, TabsProps } from "@heroui/react";
import { Key } from "@react-types/shared";
import React, { useCallback } from "react";

import { useRouter } from "@/i18n/routing";

import { PageContent, PageContentProps } from "./page-content";

export type PageTab = {
  key: Key;
  title: string;
  content: React.ReactNode;
  url: string;
  className?: string;
};

export type TabbedPageContentProps = Pick<
  PageContentProps,
  "actions" | "helpPage" | "pageInfo" | "titleEnd"
> &
  Pick<TabsProps, "destroyInactiveTabPanel"> & {
    tabs: PageTab[];
    selectedTabKey: Key;
  };

export const TabbedPageContent: React.FC<TabbedPageContentProps> = ({
  pageInfo,
  actions,
  titleEnd,
  helpPage,
  tabs,
  selectedTabKey,
  destroyInactiveTabPanel,
}) => {
  const router = useRouter();

  const onSelectionChange = useCallback(
    (key: Key) => {
      const url = tabs.find((tab) => tab.key === key)?.url;

      if (url) {
        router.push(url);
      }
    },
    [tabs, router],
  );

  return (
    <PageContent
      pageInfo={pageInfo}
      actions={actions}
      titleEnd={titleEnd}
      helpPage={helpPage}
      noPadding
    >
      <div className="max-h-full grid grid-cols-1 grid-rows-[auto_minmax(0,_1fr)]">
        <Tabs
          classNames={{
            base: ["p-4", "pb-2", "w-full"],
            panel: ["p-4", "max-h-full", "overflow-auto"],
            tabList: "p-0",
          }}
          color="secondary"
          variant="underlined"
          size="lg"
          destroyInactiveTabPanel={destroyInactiveTabPanel}
          selectedKey={selectedTabKey}
          onSelectionChange={onSelectionChange}
        >
          {tabs.map(({ key, title, content, className }) => (
            <Tab key={key} title={title} className={className}>
              {content}
            </Tab>
          ))}
        </Tabs>
      </div>
    </PageContent>
  );
};
