import { ZonedDateTime } from "@internationalized/date";
import { z, ZodTypeAny } from "zod";

export const nullableInput = <T extends ZodTypeAny>(
  schema: T,
  message = "Output value can not be null",
) => {
  return schema.nullable().transform((val, ctx) => {
    if (val === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message,
      });

      return z.NEVER;
    }

    return val;
  });
};

export const preprocessInputNumber = (arg: unknown) =>
  arg === "" ? undefined : Number(arg);

export const zonedDateTime = (params?: { message?: string }) =>
  z.custom<ZonedDateTime>((val) => val instanceof ZonedDateTime, {
    message: params?.message ?? "Invalid date",
  });
