"use client";

import { Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export type LoginButtonProps = {
  providerId: string;
  providerName: string;
  icon?: ReactNode;
};

export const LoginButton = (props: LoginButtonProps) => {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  return (
    <Button
      className="text-white bg-black/20"
      variant="flat"
      startContent={props.icon}
      onPress={() =>
        signIn(props.providerId, { redirectTo: callbackUrl ?? "/" })
      }
    >
      {t("LoginButton.text", { provider: props.providerName })}
    </Button>
  );
};
