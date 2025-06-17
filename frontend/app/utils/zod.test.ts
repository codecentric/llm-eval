import { parseAbsoluteToLocal } from "@internationalized/date";
import { SafeParseSuccess, z } from "zod";

import { nullableInput, zonedDateTime } from "@/app/utils/zod";

describe("ZOD utils", () => {
  describe("nullableInput", () => {
    it("should allow null as input but fail validation", () => {
      const schema = z.object({ a: nullableInput(z.string()) });

      const data: z.input<typeof schema> = {
        a: null,
      };

      const result = schema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toEqual(
        "Output value can not be null",
      );
    });

    it("should pass validation if value is not null", () => {
      const schema = z.object({ a: nullableInput(z.string()) });

      const data: z.input<typeof schema> = {
        a: "test",
      };

      const result = schema.safeParse(data);

      expect(result).toEqual({
        success: true,
        data,
      } satisfies SafeParseSuccess<typeof data>);
    });
  });

  describe("zonedDateTime", () => {
    it("should pass validation if value is a valid date", () => {
      const schema = z.object({ a: zonedDateTime() });
      const data: z.input<typeof schema> = {
        a: parseAbsoluteToLocal("2023-10-01T12:00:00Z"),
      };

      const result = schema.safeParse(data);

      expect(result).toEqual({
        success: true,
        data,
      } satisfies SafeParseSuccess<typeof data>);
    });

    it("should fail validation if value is not a valid date", () => {
      const schema = z.object({ a: zonedDateTime() });

      const result = schema.safeParse({ a: "invalid-date" });

      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toEqual("Invalid date");
    });

    it("should fail validation if value is not a valid date with custom message", () => {
      const schema = z.object({ a: zonedDateTime({ message: "FAILED" }) });

      const result = schema.safeParse({ a: "invalid-date" });

      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toEqual("FAILED");
    });
  });
});
