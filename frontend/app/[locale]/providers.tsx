"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from "jotai";
import React from "react";

import { ConfirmDialogProvider } from "@/app/[locale]/components/confirm-dialog-provider";
import { makeQueryClient } from "@/app/utils/react-query/client";
import { useRouter } from "@/i18n/routing";

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();
  const queryClient = getQueryClient();

  return (
    <JotaiProvider>
      <HeroUIProvider navigate={router.push} className="h-full" locale={locale}>
        <QueryClientProvider client={queryClient}>
          <ConfirmDialogProvider>
            <ToastProvider
              toastProps={{ timeout: 3000, shouldShowTimeoutProgress: true }}
            />
            {children}
          </ConfirmDialogProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </HeroUIProvider>
    </JotaiProvider>
  );
}
