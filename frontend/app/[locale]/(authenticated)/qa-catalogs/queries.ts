import {
  qaCatalogGetAll,
  qaCatalogGetGeneratorTypes,
  qaCatalogGetHistory,
} from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
  queryDefinition,
} from "@/app/utils/react-query";

export type QaCatalogsQueryParams = {
  limit?: number;
  name?: string;
};

export const QA_CATALOGS_LIMIT = 50;

export const QA_CATALOGS_QUERY_BASE_KEY = "qaCatalogs";
export const qaCatalogsQueryDefinition = ({
  name,
  limit = QA_CATALOGS_LIMIT,
}: QaCatalogsQueryParams = {}) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [QA_CATALOGS_QUERY_BASE_KEY, { name, limit }],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(limit),
      select: (result) => result.pages.flat(),
    },
    query: qaCatalogGetAll<true>,
    queryOptions: ({ pageParam }) => ({
      query: {
        limit,
        offset: pageParam,
        name,
      },
    }),
  });

export const QA_CATALOG_GENERATOR_TYPES_QUERY_BASE_KEY =
  "activeQaCatalogGeneratorTypes";
export const activeQaCatalogTypesQueryDefinition = queryDefinition({
  options: {
    queryKey: [QA_CATALOG_GENERATOR_TYPES_QUERY_BASE_KEY],
  },
  query: qaCatalogGetGeneratorTypes<true>,
});

export const QA_CATALOG_HISTORY_QUERY_BASE_KEY = "qaCatalogHistory";
export const qaCatalogHistoryHistoryQueryDefinition = (catalogId: string) =>
  queryDefinition({
    options: {
      queryKey: [QA_CATALOG_HISTORY_QUERY_BASE_KEY, catalogId],
    },
    query: qaCatalogGetHistory<true>,
    queryOptions: {
      path: {
        catalog_id: catalogId,
      },
    },
  });
