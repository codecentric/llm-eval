import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginPage } from "@/app/[locale]/login/components/login-page";
import { getProviderSettings } from "@/auth";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations();

  return {
    title: t("LoginPage.title"),
  };
};

export default async function Login() {
  const providerSettings = getProviderSettings();

  return (
    <LoginPage
      providers={providerSettings.map(({ id, name }) => ({ id, name }))}
    />
  );
}
