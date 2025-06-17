import {
  QueryFunctionContext,
  UnusedSkipTokenInfiniteOptions,
} from "@tanstack/react-query";

import {
  DataShape,
  ServiceCallOptionalOptions,
  ServiceCallRequiredOptions,
} from "@/app/utils/backend-client/service-call";

import type { Options } from "@hey-api/client-fetch";
import type { QueryKey } from "@tanstack/query-core";

type InfiniteQueryDefinitionBase<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TPageParam,
> = {
  options: Omit<
    UnusedSkipTokenInfiniteOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >,
    "queryFn"
  >;
};

type OptionsWithoutThrowOnError<TRequestData extends DataShape> = Omit<
  Options<TRequestData, true>,
  "throwOnError"
>;

type QueryOptions<
  TQueryKey extends QueryKey,
  TPageParam,
  TRequestData extends DataShape,
> =
  | OptionsWithoutThrowOnError<TRequestData>
  | ((
      context: QueryFunctionContext<TQueryKey, TPageParam>,
    ) =>
      | OptionsWithoutThrowOnError<TRequestData>
      | Promise<OptionsWithoutThrowOnError<TRequestData>>);

type InfiniteQueryDefinitionOptionalOptions<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TPageParam,
> = InfiniteQueryDefinitionBase<
  TQueryFnData,
  TError,
  TData,
  TQueryKey,
  TPageParam
> & {
  query: ServiceCallOptionalOptions<TRequestData, TQueryFnData, unknown, true>;
  queryOptions?: QueryOptions<TQueryKey, TPageParam, TRequestData>;
};

type InfiniteQueryDefinitionRequiredOptions<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TPageParam,
> = InfiniteQueryDefinitionBase<
  TQueryFnData,
  TError,
  TData,
  TQueryKey,
  TPageParam
> & {
  query: ServiceCallRequiredOptions<TRequestData, TQueryFnData, unknown, true>;
  queryOptions: QueryOptions<TQueryKey, TPageParam, TRequestData>;
};

export type InfiniteQueryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TPageParam,
> =
  | InfiniteQueryDefinitionOptionalOptions<
      TQueryFnData,
      TRequestData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >
  | InfiniteQueryDefinitionRequiredOptions<
      TQueryFnData,
      TRequestData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >;

export function infiniteQueryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: InfiniteQueryDefinitionOptionalOptions<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
): InfiniteQueryDefinitionOptionalOptions<
  TQueryFnData,
  TRequestData,
  TError,
  TData,
  TQueryKey,
  TPageParam
>;

export function infiniteQueryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: InfiniteQueryDefinitionRequiredOptions<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
): InfiniteQueryDefinitionRequiredOptions<
  TQueryFnData,
  TRequestData,
  TError,
  TData,
  TQueryKey,
  TPageParam
>;

export function infiniteQueryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: InfiniteQueryDefinition<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
): InfiniteQueryDefinition<
  TQueryFnData,
  TRequestData,
  TError,
  TData,
  TQueryKey,
  TPageParam
> {
  return options;
}
