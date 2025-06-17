import "@/app/test-utils/mock-client";

import { Metric, metricsGet, metricsGetAll } from "@/app/client";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import {
  clientInfiniteQueryOptions,
  clientQueryOptions,
  makeQueryClient,
} from "@/app/utils/react-query/client";
import {
  getNextPageParamForListWithLimit,
  queryDefinition,
} from "@/app/utils/react-query/index";
import { infiniteQueryDefinition } from "@/app/utils/react-query/infinite-query-definition";

const testInfiniteQuery = metricsGetAll<true>;
const mockedGetAll = vi.mocked(testInfiniteQuery);

const testQuery = metricsGet<true>;
const mockedGet = vi.mocked(testQuery);

describe("react query client utils", () => {
  const metric = {} as unknown as Metric;

  describe("clientInfiniteQueryOptions", () => {
    it("returns query options with query function which calls backend", async () => {
      mockedGetAll.mockResolvedValue(successfulServiceResponse([metric]));

      const definition = infiniteQueryDefinition({
        options: {
          queryKey: ["TEST"],
          initialPageParam: 0,
          select: (data) => data.pages.flat(),
          getNextPageParam: getNextPageParamForListWithLimit(10),
        },
        query: testInfiniteQuery,
        queryOptions: ({ pageParam }) => ({
          query: {
            limit: 10,
            offset: pageParam,
          },
        }),
      });

      const options = clientInfiniteQueryOptions(definition);

      expect(options.queryKey).toEqual(definition.options.queryKey);
      expect(options.initialPageParam).toEqual(
        definition.options.initialPageParam,
      );
      expect(options.select).toEqual(definition.options.select);
      expect(options.getNextPageParam).toEqual(
        definition.options.getNextPageParam,
      );

      const controller = new AbortController();
      const result = await options.queryFn?.({
        pageParam: 0,
        queryKey: options.queryKey,
        signal: controller.signal,
        direction: "forward",
        meta: undefined,
        client: makeQueryClient(),
      });

      expect(result).toEqual([metric]);
      expect(testInfiniteQuery).toHaveBeenCalledWith({
        query: {
          limit: 10,
          offset: 0,
        },
      });
    });
  });

  describe("clientQueryOptions", () => {
    it("returns query options with query function which calls backend", async () => {
      mockedGet.mockResolvedValue(successfulServiceResponse(metric));

      const definition = queryDefinition({
        options: {
          queryKey: ["TEST"],
        },
        query: testQuery,
        queryOptions: {
          path: { metric_id: "1" },
        },
      });

      const options = clientQueryOptions(definition);

      expect(options.queryKey).toEqual(definition.options.queryKey);

      const controller = new AbortController();
      const result = await options.queryFn?.({
        queryKey: options.queryKey,
        signal: controller.signal,
        direction: "forward",
        meta: undefined,
        client: makeQueryClient(),
      });

      expect(result).toEqual(metric);
      expect(testQuery).toHaveBeenCalledWith({
        path: { metric_id: "1" },
      });
    });
  });
});
