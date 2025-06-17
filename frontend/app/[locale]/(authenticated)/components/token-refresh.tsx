"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";
import { Cancel, useRecursiveTimeout } from "@/app/hooks/use-recursive-timeout";
import { usePathname } from "@/i18n/routing";

const refreshAccessToken = async () => {
  try {
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
    });

    const body = await response.json();

    if (response.ok) {
      return body.expiresIn - 10000;
    }
  } catch (e) {
    console.error("Unexpected error updating refresh token.", e);
  }

  return Cancel;
};

export type TokenRefreshProps = {
  expiresIn?: number;
};

export const TokenRefresh = ({ expiresIn }: TokenRefreshProps) => {
  const { showConfirmDialog, okFunction } = useConfirmDialog();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const action = useCallback(async () => {
    const result = await refreshAccessToken();

    if (result === Cancel) {
      showConfirmDialog({
        header: (
          <div className="text-danger">
            {t("TokenRefresh.errorDialog.header")}
          </div>
        ),
        description: t("TokenRefresh.errorDialog.description"),
        okButtonLabel: t("TokenRefresh.errorDialog.okButton"),
        onOk: okFunction(() =>
          signIn(undefined, {
            redirectTo:
              searchParams.size > 0
                ? `${pathname}?${searchParams.toString()}`
                : pathname,
          }),
        ),
        noCancel: true,
      });
    }

    return result;
  }, [showConfirmDialog, pathname, searchParams, t, okFunction]);

  useRecursiveTimeout(expiresIn, action);

  return null;
};
