import { qaCatalogGet, qaCatalogGetCatalogQaPairs } from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
  queryDefinition,
} from "@/app/utils/react-query";

export const QA_CATALOG_QUERY_BASE_KEY = "qaCatalog";
export const qaCatalogQueryDefinition = (catalogId: string) =>
  queryDefinition({
    options: {
      queryKey: [QA_CATALOG_QUERY_BASE_KEY, catalogId],
    },
    query: qaCatalogGet<true>,
    queryOptions: {
      path: {
        catalog_id: catalogId,
      },
    },
  });

const QA_CATALOG_QA_PAIRS_LIMIT = 50;

export const QA_CATALOG_QA_PAIRS_QUERY_KEY = "qaCatalogQaPairs";
export const qaCatalogQaPairsQueryDefinition = (catalogId: string) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [QA_CATALOG_QA_PAIRS_QUERY_KEY, catalogId],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(
        QA_CATALOG_QA_PAIRS_LIMIT,
      ),
      select: (result) => result.pages.flat(),
    },
    query: qaCatalogGetCatalogQaPairs<true>,
    queryOptions: ({ pageParam }) => ({
      path: {
        catalog_id: catalogId,
      },
      query: {
        limit: QA_CATALOG_QA_PAIRS_LIMIT,
        offset: pageParam,
      },
    }),
  });
