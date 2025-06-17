import "@/app/test-utils/mock-intl";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import { ConfirmDialogProvider } from "@/app/[locale]/components/confirm-dialog-provider";

const IntlWrapper = MockIntlWrapper;

export const createPageWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: () => true,
      },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: PropsWithChildren) => (
    <IntlWrapper>
      <ConfirmDialogProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConfirmDialogProvider>
    </IntlWrapper>
  );
};
