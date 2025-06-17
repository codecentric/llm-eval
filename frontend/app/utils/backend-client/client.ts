import { Options } from "@hey-api/client-fetch";

import {
  DataShape,
  ServiceCall,
  ServiceCallOptionalOptions,
  ServiceCallRequiredOptions,
} from "@/app/utils/backend-client/service-call";

import { initClient } from "./init-client";

const client = initClient({ baseUrl: "/api/backend" });

export function withConfig<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
>(
  service: ServiceCallOptionalOptions<Data, Response, TError, ThrowOnError>,
): ServiceCallOptionalOptions<Data, Response, TError, ThrowOnError>;

export function withConfig<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
>(
  service: ServiceCallRequiredOptions<Data, Response, TError, ThrowOnError>,
): ServiceCallRequiredOptions<Data, Response, TError, ThrowOnError>;

export function withConfig<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
>(
  service: ServiceCall<Data, Response, TError, ThrowOnError>,
): ServiceCall<Data, Response, TError, ThrowOnError> {
  // @ts-expect-error assignment works fine
  return async (options: Options<Data, ThrowOnError> | undefined) => {
    return service({
      ...options,
      client,
    } as Options<Data, ThrowOnError>);
  };
}

// noinspection DuplicatedCode
export async function callApi<Data extends DataShape, Response, TError>(
  service: ServiceCallOptionalOptions<Data, Response, TError, true>,
  options?: Options<Data, true>,
): Promise<Response>;

export async function callApi<Data extends DataShape, Response, TError>(
  service: ServiceCallRequiredOptions<Data, Response, TError, true>,
  options: Options<Data, true>,
): Promise<Response>;

export async function callApi<Data extends DataShape, Response, TError>(
  service: ServiceCall<Data, Response, TError, true>,
  options: Options<Data, true> | undefined,
): Promise<Response> {
  // @ts-expect-error fine for runtime
  const response = await withConfig(service)({
    ...options,
    throwOnError: true,
  });

  return response.data;
}
