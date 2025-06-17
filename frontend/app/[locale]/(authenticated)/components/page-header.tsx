"use client";

import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Divider,
  Tooltip,
} from "@heroui/react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { IoMdHelp } from "react-icons/io";

import {
  flattenPageInfo,
  PageInfo,
} from "@/app/[locale]/(authenticated)/page-info";
import { showContextHelpAtom } from "@/app/state/context-help";

export type PageHeaderProps = {
  pageInfo: PageInfo;
  actions?: ReactNode[];
  titleEnd?: ReactNode;
  className?: string;
  hasContextHelp?: boolean;
};

export const PageHeader = ({
  pageInfo,
  actions,
  titleEnd,
  className,
  hasContextHelp,
}: PageHeaderProps) => {
  const t = useTranslations();

  const [showContextHelp, setShowContextHelp] = useAtom(showContextHelpAtom);

  const pageName = pageInfo.rawName
    ? pageInfo.name
    : t(pageInfo.name, pageInfo.nameArgs);

  return (
    <div id="main-page-content" className={className}>
      <div className="flex justify-between items-start">
        <Breadcrumbs
          variant="bordered"
          radius="md"
          size="sm"
          className="my-4"
          role="navigation"
          tabIndex={-1}
        >
          {flattenPageInfo(pageInfo).map((pi) => {
            const name = pi.shortName
              ? t(pi.shortName, pi.nameArgs)
              : pi.rawName
                ? pi.name
                : t(pi.name, pi.nameArgs);

            return (
              <BreadcrumbItem
                key={pi.key}
                href={pi.href}
                startContent={pi.icon}
                classNames={{ item: "flex items-center" }}
                aria-label={name}
              >
                {name}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumbs>

        {hasContextHelp && (
          <Tooltip
            content={
              showContextHelp
                ? t("PageHeader.hideContextHelp")
                : t("PageHeader.showContextHelp")
            }
          >
            <Button
              isIconOnly
              variant={showContextHelp ? "solid" : "ghost"}
              radius="full"
              size="sm"
              className="mr-4 mt-4"
              onPress={() => setShowContextHelp()}
              aria-label={
                showContextHelp
                  ? t("PageHeader.hideContextHelp")
                  : t("PageHeader.showContextHelp")
              }
            >
              <IoMdHelp size={24} />
            </Button>
          </Tooltip>
        )}
      </div>

      <div className="flex items-end my-4" role="group">
        <h1
          className="text-2xl font-extrabold flex items-center gap-3"
          tabIndex={0}
          aria-label={pageName}
          data-testid="page-title"
        >
          {pageInfo.icon} {pageName} {titleEnd}
        </h1>
        <menu className="grow justify-end flex gap-2 mr-4">{actions}</menu>
      </div>

      <Divider />
    </div>
  );
};
