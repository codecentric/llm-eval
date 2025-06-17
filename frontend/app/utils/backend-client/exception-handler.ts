import { Client } from "@hey-api/client-fetch";
import { StatusCodes } from "http-status-codes";

import { HttpValidationError } from "@/app/client";
import { ToNumber } from "@/app/types/to-number";

export type InternalServerError = {
  status: StatusCodes.INTERNAL_SERVER_ERROR;
  error: string;
};

export type HttpError = {
  status: Exclude<
    ToNumber<`${StatusCodes}`>,
    | typeof StatusCodes.INTERNAL_SERVER_ERROR
    | typeof StatusCodes.UNPROCESSABLE_ENTITY
  >;
  error: { detail: string };
};

export type ValidationError = {
  status: StatusCodes.UNPROCESSABLE_ENTITY;
  error: HttpValidationError;
};

export type ResponseError = InternalServerError | ValidationError | HttpError;

export function isResponseError(error: unknown): error is ResponseError {
  return typeof error === "object" && error !== null && "status" in error;
}

export const exceptionHandler: Parameters<
  Client["interceptors"]["error"]["use"]
>[0] = (error, response) => {
  return { status: response.status, error };
};
