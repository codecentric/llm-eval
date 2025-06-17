import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";

export const ThemeSelect = () => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const { theme, setTheme, themes } = useTheme();

  const themeSelectionChanged = useCallback(
    (keys: SharedSelection) => {
      if (typeof keys !== "string") {
        const value = keys.values().next().value;
        if (typeof value === "string") {
          setTheme(value);
        }
      }
    },
    [setTheme],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Select
      className="w-28"
      selectedKeys={theme ? [theme] : undefined}
      aria-label={t("ThemeSelect.ariaLabel")}
      variant="bordered"
      size="sm"
      onSelectionChange={themeSelectionChanged}
    >
      {themes.map((theme) => (
        <SelectItem key={theme}>{t(`ThemeSelect.option.${theme}`)}</SelectItem>
      ))}
    </Select>
  );
};
