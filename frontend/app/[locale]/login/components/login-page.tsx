"use client";

import { Card, CardBody, Divider, Spinner } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { LoginButton } from "@/app/[locale]/login/components/login-button";
import { Logo } from "@/app/components/logo";

export type LoginPageProps = {
  providers: { id: string; name: string }[];
};

export const LoginPage = ({ providers }: LoginPageProps) => {
  const t = useTranslations();

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  useEffect(() => {
    // automatically sign in if we have only one provider
    if (providers.length === 1) {
      // noinspection JSIgnoredPromiseFromCall
      signIn(providers[0].id, { redirectTo: callbackUrl ?? "/" });
    }
  }, [providers, callbackUrl]);

  return providers.length === 1 ? (
    <div className="h-full flex flex-col items-center justify-center">
      <Spinner
        size="lg"
        color="secondary"
        label={t("LoginPage.spinner.label")}
      />
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600">
      <Card isBlurred shadow="sm">
        <CardBody>
          <div className="flex gap-4">
            <div className="flex flex-col gap-8">
              <h1 className="text-2xl">{t("LoginPage.title")}</h1>
              <div className="flex flex-col gap-2">
                {providers.map((provider) => (
                  <LoginButton
                    key={provider.id}
                    providerId={provider.id}
                    providerName={provider.name}
                  />
                ))}
              </div>
            </div>
            <Divider orientation="vertical" />
            <div>
              <Logo />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
