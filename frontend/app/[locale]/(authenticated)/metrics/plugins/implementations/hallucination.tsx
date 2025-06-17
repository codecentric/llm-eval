import { createSimpleMetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins/simple-metric";

export const hallucinationMetric = createSimpleMetricPlugin({
  type: "HALLUCINATION",
  getDefaults: () => ({
    includeReason: true,
    chatModelId: null,
    strictMode: false,
    threshold: 0.5,
  }),
});
