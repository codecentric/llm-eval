import { createSimpleMetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins/simple-metric";

export const answerRelevancyMetric = createSimpleMetricPlugin({
  type: "ANSWER_RELEVANCY",
  getDefaults: () => ({
    includeReason: true,
    chatModelId: null,
    strictMode: false,
    threshold: 0.5,
  }),
});
