import {
  evaluationResultsGetGrouped,
  evaluationsGet,
  evaluationsGetEvaluationDetailSummary,
} from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
  queryDefinition,
} from "@/app/utils/react-query";

const TEST_CASES_LIMIT = 50;

export const GROUPED_TEST_CASES_QUERY_BASE_KEY = "groupedTestCases";
export const groupedTestCasesQueryDefinition = (evaluationId: string) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [GROUPED_TEST_CASES_QUERY_BASE_KEY, evaluationId],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(TEST_CASES_LIMIT),
      select: (result) => result.pages.flat(),
    },
    query: evaluationResultsGetGrouped<true>,
    queryOptions: ({ pageParam }) => ({
      query: {
        offset: pageParam,
        limit: TEST_CASES_LIMIT,
        evaluation_id: evaluationId,
      },
    }),
  });

export const EVALUATION_SUMMARY_QUERY_BASE_KEY = "evaluationSummary";
export const evaluationDetailsSummeryQueryDefinition = (evaluationId: string) =>
  queryDefinition({
    options: {
      queryKey: [EVALUATION_SUMMARY_QUERY_BASE_KEY, evaluationId],
    },
    query: evaluationsGetEvaluationDetailSummary<true>,
    queryOptions: {
      path: {
        evaluation_id: evaluationId,
      },
    },
  });

export const EVALUATION_QUERY_BASE_KEY = "evaluation";
export const evaluationQueryDefinition = (evaluationId: string) =>
  queryDefinition({
    options: {
      queryKey: [EVALUATION_QUERY_BASE_KEY, evaluationId],
    },
    query: evaluationsGet<true>,
    queryOptions: {
      path: {
        evaluation_id: evaluationId,
      },
    },
  });
