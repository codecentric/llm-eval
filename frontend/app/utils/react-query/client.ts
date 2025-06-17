import { Options } from "@hey-api/client-fetch";
import {
  infiniteQueryOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { callApi } from "@/app/utils/backend-client/client";
import { DataShape } from "@/app/utils/backend-client/service-call";
import {
  InfiniteQueryDefinition,
  QueryDefinition,
} from "@/app/utils/react-query";

import type { QueryKey } from "@tanstack/query-core";

export type ClientOptions = {
  enabled?: boolean;
};

export const clientInfiniteQueryOptions = <
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
  options?: ClientOptions,
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
    ...options,
  });

export const clientQueryOptions = <
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
  options?: ClientOptions,
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
    ...options,
  });

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
        retryOnMount: false,
      },
    },
  });
};
