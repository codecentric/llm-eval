import { StatusCodes } from "http-status-codes";

const request = {} as Request;
const response = {} as Response;

export const successfulServiceResponse = <T>(data: T) => ({
  request,
  response,
  data,
  error: undefined,
});

export const errorServiceResponse = <T>(
  error: T,
  status: StatusCodes = StatusCodes.BAD_REQUEST,
) => ({
  request,
  response: {
    ...response,
    status,
  },
  data: undefined,
  error,
});
