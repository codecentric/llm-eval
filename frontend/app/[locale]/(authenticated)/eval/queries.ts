import { evaluationsGetAll } from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
} from "@/app/utils/react-query";

const EVALUATIONS_LIMIT = 50;

export type EvaluationsQueryParams = {
  limit?: number;
  query?: string;
  from?: Date;
  to?: Date;
};

export const EVALUATIONS_QUERY_BASE_KEY = "evaluations";
export const evaluationsQueryDefinition = ({
  limit = EVALUATIONS_LIMIT,
  query,
  from,
  to,
}: EvaluationsQueryParams = {}) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [EVALUATIONS_QUERY_BASE_KEY, { limit, query, from, to }],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(limit),
      select: (result) => result.pages.flat(),
    },
    query: evaluationsGetAll<true>,
    queryOptions: ({ pageParam }) => ({
      query: {
        limit,
        offset: pageParam,
        query,
        from_date: from?.toISOString(),
        to_date: to?.toISOString(),
      },
    }),
  });
