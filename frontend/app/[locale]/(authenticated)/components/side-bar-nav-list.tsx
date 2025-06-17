import { Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import React from "react";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export type SideBarNavListProps = {
  pages: PageInfo[];
  segment?: string | null;
  section?: string;
  className?: string;
};

export const SideBarNavList: React.FC<SideBarNavListProps> = ({
  pages,
  segment,
  section,
  className,
}) => {
  const t = useTranslations();

  const activePage = pages.find(
    (page) => page.href === (segment ? `/${segment}` : "/"),
  );

  const pageItems = pages.map((page) => {
    const name = t(page.name, page.nameArgs);

    return (
      <ListboxItem
        key={page.key}
        href={page.href}
        startContent={page.icon}
        variant="bordered"
        aria-label={name}
        classNames={{
          base: cx(
            "p-2",
            "data-[selected=true]:text-secondary data-[selected=true]:border-secondary",
            "data-[selected=true]:hover:text-primary data-[selected=true]:hover:border-primary",
          ),
          selectedIcon: "hidden",
        }}
      >
        {name}
      </ListboxItem>
    );
  });

  return (
    <Listbox
      variant="flat"
      aria-label={t("SideBarNavList.listbox.label")}
      role="navigation"
      className={className}
      emptyContent={null}
      color="primary"
      selectedKeys={activePage ? [activePage.key] : undefined}
      selectionMode="single"
    >
      {section ? (
        <ListboxSection
          title={section}
          aria-label={t("SideBarNavList.section.label", { section })}
        >
          {pageItems}
        </ListboxSection>
      ) : (
        pageItems
      )}
    </Listbox>
  );
};
