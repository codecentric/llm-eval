import { Options, RequestResult } from "@hey-api/client-fetch";

export interface DataShape {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
  url: string;
}

export type ServiceCallOptionalOptions<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
> = (
  options?: Options<Data, ThrowOnError>,
) => RequestResult<Response, TError, ThrowOnError>;

export type ServiceCallRequiredOptions<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
> = (
  options: Options<Data, ThrowOnError>,
) => RequestResult<Response, TError, ThrowOnError>;

export type ServiceCall<
  Data extends DataShape,
  Response,
  TError,
  ThrowOnError extends boolean,
> =
  | ServiceCallOptionalOptions<Data, Response, TError, ThrowOnError>
  | ServiceCallRequiredOptions<Data, Response, TError, ThrowOnError>;
