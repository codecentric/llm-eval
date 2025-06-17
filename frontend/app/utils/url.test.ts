import { buildQueryParams } from "@/app/utils/url";

describe("URL utils", () => {
  describe("buildQueryParams", () => {
    it("should return empty string if query has no entries", () => {
      expect(buildQueryParams({})).toEqual("");
    });

    it("should build query string for single value", () => {
      expect(buildQueryParams({ a: "xxx" })).toEqual("?a=xxx");
    });

    it("should build query string for multiple values", () => {
      expect(buildQueryParams({ a: "xxx", b: 123 })).toEqual("?a=xxx&b=123");
    });

    it("should build query and ignore undefined values", () => {
      expect(buildQueryParams({ a: "xxx", b: undefined, c: 123 })).toEqual(
        "?a=xxx&c=123",
      );
    });

    it("should build query and ignore default values", () => {
      expect(
        buildQueryParams({ a: "xxx", b: 123 }, { a: "xxx", b: 456 }),
      ).toEqual("?b=123");
    });

    it("should build query and include array values", () => {
      expect(buildQueryParams({ a: ["xxx", "yyy"] })).toEqual("?a=xxx&a=yyy");
    });
  });
});
