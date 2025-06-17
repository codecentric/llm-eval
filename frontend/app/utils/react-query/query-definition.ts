import {
  QueryFunctionContext,
  UnusedSkipTokenOptions,
} from "@tanstack/react-query";

import {
  DataShape,
  ServiceCallOptionalOptions,
  ServiceCallRequiredOptions,
} from "@/app/utils/backend-client/service-call";

import type { Options } from "@hey-api/client-fetch";
import type { QueryKey } from "@tanstack/query-core";

type QueryDefinitionBase<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = {
  options: Omit<
    UnusedSkipTokenOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryFn"
  >;
};

type OptionsWithoutThrowOnError<TRequestData extends DataShape> = Omit<
  Options<TRequestData, true>,
  "throwOnError"
>;

type QueryOptions<TQueryKey extends QueryKey, TRequestData extends DataShape> =
  | OptionsWithoutThrowOnError<TRequestData>
  | ((
      context: QueryFunctionContext<TQueryKey, never>,
    ) =>
      | OptionsWithoutThrowOnError<TRequestData>
      | Promise<OptionsWithoutThrowOnError<TRequestData>>);

type QueryDefinitionOptionalOptions<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = QueryDefinitionBase<TQueryFnData, TError, TData, TQueryKey> & {
  query: ServiceCallOptionalOptions<TRequestData, TQueryFnData, unknown, true>;
  queryOptions?: QueryOptions<TQueryKey, TRequestData>;
};

type QueryDefinitionRequiredOptions<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = QueryDefinitionBase<TQueryFnData, TError, TData, TQueryKey> & {
  query: ServiceCallRequiredOptions<TRequestData, TQueryFnData, unknown, true>;
  queryOptions: QueryOptions<TQueryKey, TRequestData>;
};

export type QueryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> =
  | QueryDefinitionOptionalOptions<
      TQueryFnData,
      TRequestData,
      TError,
      TData,
      TQueryKey
    >
  | QueryDefinitionRequiredOptions<
      TQueryFnData,
      TRequestData,
      TError,
      TData,
      TQueryKey
    >;

export function queryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryDefinitionOptionalOptions<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey
  >,
): QueryDefinitionOptionalOptions<
  TQueryFnData,
  TRequestData,
  TError,
  TData,
  TQueryKey
>;

export function queryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryDefinitionRequiredOptions<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey
  >,
): QueryDefinitionRequiredOptions<
  TQueryFnData,
  TRequestData,
  TError,
  TData,
  TQueryKey
>;

export function queryDefinition<
  TQueryFnData,
  TRequestData extends DataShape,
  TError,
  TData = TQueryFnData,
  const TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryDefinition<
    TQueryFnData,
    TRequestData,
    TError,
    TData,
    TQueryKey
  >,
): QueryDefinition<TQueryFnData, TRequestData, TError, TData, TQueryKey> {
  return options;
}
