import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { pageMetadata } from "@/app/[locale]/(authenticated)/page-info";
import { activeQaCatalogTypesQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import {
  makeQueryClient,
  serverQueryOptions,
} from "@/app/utils/react-query/server";

import { GenerateCatalogPage } from "./components/generate-catalog-page";
import { generateQACatalogPage } from "./page-info";

export const generateMetadata = pageMetadata(generateQACatalogPage);

export default async function GenerateQACatalogPage() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery(
    serverQueryOptions(activeQaCatalogTypesQueryDefinition),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GenerateCatalogPage />
    </HydrationBoundary>
  );
}
