import "@/app/test-utils/mock-intl";

import { renderHook } from "@testing-library/react";

import { PageData, PageDataType } from "@/app/types/page-data";

import { usePageData } from "./use-page-data";

describe("usePageData", () => {
  it("should return error data if an error was provided", () => {
    const error = Error("ERR");

    const { result } = renderHook(() => usePageData(undefined, error));

    expect(result.current).toEqual({
      type: PageDataType.ERROR,
      error,
    } satisfies PageData<unknown>);
  });

  it("should return error data if no error was provided, but data is falsy", () => {
    const { result } = renderHook(() => usePageData(undefined, undefined));

    expect(result.current).toEqual({
      type: PageDataType.ERROR,
      error: "DetailsPage.noData",
    } satisfies PageData<unknown>);
  });

  it("should return the data if there is no error", () => {
    const data = 123;

    const { result } = renderHook(() => usePageData(data, undefined));

    expect(result.current).toEqual({
      type: PageDataType.DATA,
      data,
    } satisfies PageData<typeof data>);
  });
});
