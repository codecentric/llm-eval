"use client";

import { Divider } from "@heroui/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";

import { SideBarUserItem } from "@/app/[locale]/(authenticated)/components/side-bar-user-item";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import { Logo } from "@/app/components/logo";

import { SideBarNavList } from "./side-bar-nav-list";
import { SkipNavigation } from "./skip-navigation";

const sections: PageInfo[] = [
  homePage,
  evaluationsPage,
  qaCatalogsPage,
  llmEndpointsPage,
  metricsPage,
];

const bottomListItems: PageInfo[] = [];

export type SideBarProps = {
  user: Session["user"];
  version: string | undefined;
};

export const SideBar = ({ user, version }: SideBarProps) => {
  const t = useTranslations();
  const segment = useSelectedLayoutSegment();

  return (
    <div className="flex">
      <div className="p-4 bg-sidebar text-sidebar-foreground min-w-0 flex-1 flex flex-col">
        <Logo version={version} />
        <SkipNavigation />
        <SideBarNavList
          pages={sections}
          segment={segment}
          section={t("SideBar.sections.title")}
        />
        <div className="flex-1" />
        <SideBarNavList
          pages={bottomListItems}
          segment={segment}
          className="mb-4"
        />
        <SideBarUserItem user={user} />
      </div>
      <Divider orientation="vertical" className="w-sidebar-border" />
    </div>
  );
};
