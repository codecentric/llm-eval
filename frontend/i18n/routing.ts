import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  localePrefix: {
    mode: "as-needed",
  },
});

// noinspection JSUnusedGlobalSymbols
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
