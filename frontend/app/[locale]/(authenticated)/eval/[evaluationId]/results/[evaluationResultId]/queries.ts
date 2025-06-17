import { evaluationResultsGet } from "@/app/client";
import { queryDefinition } from "@/app/utils/react-query";

export const TEST_CASE_QUERY_BASE_KEY = "testCase";
export const testCaseQueryDefinition = (testCaseId: string) =>
  queryDefinition({
    options: {
      queryKey: [TEST_CASE_QUERY_BASE_KEY, testCaseId],
    },
    query: evaluationResultsGet<true>,
    queryOptions: {
      path: {
        result_id: testCaseId,
      },
    },
  });
