import { metricsGet, metricsGetAll, metricsGetTypes } from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
  queryDefinition,
} from "@/app/utils/react-query";

const METRICS_LIMIT = 50;

export type MetricsQueryParams = {
  limit?: number;
};

export const METRICS_QUERY_BASE_KEY = "metrics";
export const metricsQueryDefinition = ({
  limit = METRICS_LIMIT,
}: MetricsQueryParams = {}) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [METRICS_QUERY_BASE_KEY, { limit }],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(METRICS_LIMIT),
      select: (result) => result.pages.flat(),
    },
    query: metricsGetAll<true>,
    queryOptions: ({ pageParam }) => ({
      query: {
        offset: pageParam,
        limit: limit ?? 50,
      },
    }),
  });

export const ALL_METRICS_QUERY_BASE_KEY = "allMetrics";
export const allMetricsQueryDefinition = queryDefinition({
  options: {
    queryKey: [ALL_METRICS_QUERY_BASE_KEY],
  },
  query: metricsGetAll<true>,
  queryOptions: { query: { limit: 1000 } },
});

export const METRIC_QUERY_BASE_KEY = "metric";
export const metricQueryDefinition = (metricId: string) =>
  queryDefinition({
    options: {
      queryKey: [METRIC_QUERY_BASE_KEY, metricId],
    },
    query: metricsGet<true>,
    queryOptions: { path: { metric_id: metricId } },
  });

export const METRIC_TYPES_QUERY_BASE_KEY = "metricTypes";
export const metricTypesQueryDefinition = queryDefinition({
  options: { queryKey: [METRIC_TYPES_QUERY_BASE_KEY] },
  query: metricsGetTypes<true>,
});
