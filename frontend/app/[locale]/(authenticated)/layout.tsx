import React from "react";

import { SideBar } from "@/app/[locale]/(authenticated)/components/side-bar";
import { TokenRefresh } from "@/app/[locale]/(authenticated)/components/token-refresh";
import { auth } from "@/auth";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const version = process.env["APP_VERSION"];
  const expiresIn = session?.accessTokenExpiresAt
    ? Math.max(0, session.accessTokenExpiresAt * 1000 - Date.now())
    : undefined;

  return (
    <div className="w-full h-full grid grid-cols-[250px_auto] grid-rows-1">
      <TokenRefresh expiresIn={expiresIn} />
      <SideBar user={session?.user} version={version} />
      {children}
    </div>
  );
}
