import { createSimpleMetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins/simple-metric";

export const faithfulnessMetric = createSimpleMetricPlugin({
  type: "FAITHFULNESS",
  getDefaults: () => ({
    includeReason: true,
    chatModelId: null,
    strictMode: false,
    threshold: 0.5,
  }),
});
