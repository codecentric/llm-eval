import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithLocale } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
} from "@/app/utils/react-query/server";

import { QACatalogsPage } from "./components/qa-catalogs-page";
import { qaCatalogsPage } from "./page-info";
import { qaCatalogsQueryDefinition } from "./queries";

export const generateMetadata = pageMetadata(qaCatalogsPage);

export const dynamic = "force-dynamic";

export default async function QACatalogs({ params }: PropsWithLocale) {
  const { locale } = await params;

  const queryClient = makeQueryClient();

  await queryClient.prefetchInfiniteQuery(
    serverInfiniteQueryOptions(qaCatalogsQueryDefinition()),
  );

  const ContextHelp = (await import(`./help.${locale}.mdx`)).default;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QACatalogsPage contextHelp={<ContextHelp />} />
    </HydrationBoundary>
  );
}
