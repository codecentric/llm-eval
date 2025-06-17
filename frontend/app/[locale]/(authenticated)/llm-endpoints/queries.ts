import {
  llmEndpointsGet,
  llmEndpointsGetAll,
  llmEndpointsGetTypes,
  PluginFeature,
} from "@/app/client";
import {
  getNextPageParamForListWithLimit,
  infiniteQueryDefinition,
  queryDefinition,
} from "@/app/utils/react-query";

const ENDPOINTS_LIMIT = 50;

export type LlmEndpointsQueryParams = {
  limit?: number;
  query?: string;
  supportedFeatures?: PluginFeature[];
};

export const LLM_ENDPOINTS_QUERY_BASE_KEY = "llmEndpoints";
export const llmEndpointsQueryDefinition = ({
  query,
  limit = ENDPOINTS_LIMIT,
  supportedFeatures,
}: LlmEndpointsQueryParams = {}) =>
  infiniteQueryDefinition({
    options: {
      queryKey: [
        LLM_ENDPOINTS_QUERY_BASE_KEY,
        { limit, query, supportedFeatures },
      ],
      initialPageParam: 0,
      getNextPageParam: getNextPageParamForListWithLimit(limit),
      select: (result) => result.pages.flat(),
    },
    query: llmEndpointsGetAll<true>,
    queryOptions: ({ pageParam }) => ({
      query: {
        limit,
        offset: pageParam,
        q: query,
        supported_features: supportedFeatures,
      },
    }),
  });

export const LLM_ENDPOINT_TYPES_QUERY_BASE_KEY = "llmEndpointTypes";
export const llmEndpointTypesQueryDefinition = queryDefinition({
  options: {
    queryKey: [LLM_ENDPOINT_TYPES_QUERY_BASE_KEY],
  },
  query: llmEndpointsGetTypes<true>,
});

export const LLM_ENDPOINT_QUERY_BASE_KEY = "llmEndpoint";
export const llmEndpointQueryDefinition = (endpointId: string) =>
  queryDefinition({
    options: {
      queryKey: [LLM_ENDPOINT_QUERY_BASE_KEY, endpointId],
    },
    query: llmEndpointsGet<true>,
    queryOptions: {
      path: { llm_endpoint_id: endpointId },
    },
  });
