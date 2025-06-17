import { InfiniteData } from "@tanstack/react-query";

export * from "./infinite-query-definition";
export * from "./query-definition";

export const getNextPageParamForListWithLimit =
  (limit: number) =>
  <T extends unknown[]>(lastPage: T, _allPages: T[], lastPageParam: number) => {
    if (lastPage.length !== limit) {
      return undefined;
    }

    return lastPageParam + limit;
  };

export const updatePageItem = <TPageItem, TNewITem>(
  data: InfiniteData<TPageItem[]> | undefined,
  newItem: TNewITem,
  itemMapper: (newItem: TNewITem) => (oldItem: TPageItem) => TPageItem,
): InfiniteData<TPageItem[]> | undefined =>
  data && {
    pages: data.pages.map((page) => page.map(itemMapper(newItem))),
    pageParams: data.pageParams,
  };
