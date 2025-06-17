import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { PropsWithParams } from "@/app/types/page-types";
import {
  makeQueryClient,
  serverInfiniteQueryOptions,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { QACatalogDetailPage } from "./components/qa-catalog-detail-page";
import { qaCatalogDetailPage } from "./page-info";
import {
  qaCatalogQaPairsQueryDefinition,
  qaCatalogQueryDefinition,
} from "./queries";

type Props = PropsWithParams<{ catalogId: string }>;

export const generateMetadata = pageMetadata(
  qaCatalogDetailPage,
  async ({ params }: Props) => {
    const { catalogId } = await params;

    return [catalogId] as const;
  },
);

export default async function QACatalog({ params }: Props) {
  const { catalogId } = await params;

  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      serverQueryOptions(qaCatalogQueryDefinition(catalogId)),
    ),
    queryClient.prefetchInfiniteQuery(
      serverInfiniteQueryOptions(qaCatalogQaPairsQueryDefinition(catalogId)),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QACatalogDetailPage catalogId={catalogId} />
    </HydrationBoundary>
  );
}
