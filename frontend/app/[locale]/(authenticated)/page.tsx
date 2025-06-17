import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { HomePage } from "@/app/[locale]/(authenticated)/components/home-page";
import {
  homePage,
  pageMetadata,
} from "@/app/[locale]/(authenticated)/page-info";
import { dashboardDataQueryDefinition } from "@/app/[locale]/(authenticated)/queries";
import { PropsWithLocale } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

export const generateMetadata = pageMetadata(homePage);

export default async function Home({ params }: PropsWithLocale) {
  const { locale } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(dashboardDataQueryDefinition),
  );

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage contextHelp={<ContextHelp />} />
    </HydrationBoundary>
  );
}
