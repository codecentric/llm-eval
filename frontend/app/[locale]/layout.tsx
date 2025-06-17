import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import React, { ReactNode } from "react";

import { Providers } from "@/app/[locale]/providers";
import { PropsWithLocale } from "@/app/types/page-types";

import "@/app/globals.css";

const themes = ["light", "dark"];

export default async function LocaleLayout({
  children,
  params,
}: PropsWithLocale<{
  children: ReactNode;
}>) {
  const { locale } = await params;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="text-foreground bg-background h-full"
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider attribute="class" themes={themes}>
          <NextIntlClientProvider messages={messages}>
            <Providers locale={locale}>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
