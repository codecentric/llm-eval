import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { cx } from "classix";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { MdLogout } from "react-icons/md";

import { LanguageSelect } from "@/app/[locale]/(authenticated)/components/language-select";
import { ThemeSelect } from "@/app/[locale]/(authenticated)/components/theme-select";

export type SideBarUserItemProps = {
  className?: string;
  user: Session["user"];
};

export const SideBarUserItem = ({ className, user }: SideBarUserItemProps) => {
  const t = useTranslations();

  const logout = useCallback(async () => {
    await signOut({ redirectTo: "/login" });
  }, []);

  return (
    user && (
      <Dropdown>
        <DropdownTrigger>
          <User
            as="button"
            name={user.name}
            description={user.email}
            className={cx("transition-transform", className)}
            classNames={{
              wrapper: "min-w-0 flex-1 items-stretch",
              name: "text-left overflow-hidden overflow-ellipsis",
              description:
                "text-left overflow-hidden overflow-ellipsis text-foreground-600",
            }}
            avatarProps={{
              name: user.name ?? undefined,
              src: user.image ?? undefined,
            }}
          />
        </DropdownTrigger>
        <DropdownMenu variant="faded">
          <DropdownSection title={user.name ?? user.email ?? ""} showDivider>
            <DropdownItem
              isReadOnly
              key="language"
              className="cursor-default"
              variant="light"
              endContent={<LanguageSelect />}
            >
              {t("SideBarUserItem.menu.language.text")}
            </DropdownItem>
            <DropdownItem
              isReadOnly
              key="theme"
              className="cursor-default"
              variant="light"
              endContent={<ThemeSelect />}
            >
              {t("SideBarUserItem.menu.theme.text")}
            </DropdownItem>
          </DropdownSection>
          <DropdownItem
            key="logout"
            startContent={<MdLogout />}
            onPress={() => logout()}
          >
            {t("SideBarUserItem.menu.logout.text")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  );
};
