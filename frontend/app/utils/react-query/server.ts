import { Options } from "@hey-api/client-fetch";
import {
  infiniteQueryOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { callApi } from "@/app/utils/backend-client/server";
import { DataShape } from "@/app/utils/backend-client/service-call";
import {
  InfiniteQueryDefinition,
  QueryDefinition,
} from "@/app/utils/react-query";

import type { QueryKey } from "@tanstack/query-core";

export const serverInfiniteQueryOptions = <
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TPageParam,
>(
  queryDefinition: InfiniteQueryDefinition<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
) =>
  infiniteQueryOptions({
    ...queryDefinition.options,
    queryFn: async (context) => {
      const queryOptions =
        typeof queryDefinition.queryOptions === "function"
          ? await queryDefinition.queryOptions(context)
          : queryDefinition.queryOptions;

      return callApi(
        queryDefinition.query,
        queryOptions as Options<TRequestData, true>,
      );
    },
  });

export const serverQueryOptions = <
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData,
  TQueryKey extends QueryKey,
>(
  queryDefinition: QueryDefinition<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey
  >,
) =>
  queryOptions({
    ...queryDefinition.options,
    queryFn: async (context) => {
      const queryOptions =
        typeof queryDefinition.queryOptions === "function"
          ? await queryDefinition.queryOptions(context)
          : queryDefinition.queryOptions;

      return callApi(
        queryDefinition.query,
        queryOptions as Options<TRequestData, true>,
      );
    },
  });

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        shouldDehydrateQuery: () => true,
      },
    },
  });
};
