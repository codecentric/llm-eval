import { QueryClient, QueryKey } from "@tanstack/react-query";

import { QueryDefinition } from "./query-definition";
import { makeQueryClient, serverQueryOptions } from "./server";

import type { DataShape } from "@/app/utils/backend-client/service-call";

export async function fetchIgnoringErrors<
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
  queryClient: QueryClient,
): Promise<TQueryFnData | undefined>;

export async function fetchIgnoringErrors<
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
): Promise<{ data: TQueryFnData | undefined; queryClient: QueryClient }>;

export async function fetchIgnoringErrors<
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
  queryClient?: QueryClient,
): Promise<
  | { data: TQueryFnData | undefined; queryClient: QueryClient }
  | TQueryFnData
  | undefined
> {
  if (queryClient) {
    try {
      const result = await queryClient.fetchQuery(
        serverQueryOptions(queryDefinition),
      );

      return result;
    } catch {
      return undefined;
    }
  } else {
    queryClient = makeQueryClient();

    try {
      const result = await queryClient.fetchQuery(
        serverQueryOptions(queryDefinition),
      );

      return { data: result, queryClient };
    } catch {
      return { queryClient, data: undefined };
    }
  }
}
