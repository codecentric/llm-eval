import { answerRelevancyMetric } from "@/app/[locale]/(authenticated)/metrics/plugins/implementations/answer-relevancy";
import { faithfulnessMetric } from "@/app/[locale]/(authenticated)/metrics/plugins/implementations/faithfulness";
import { gEvalMetric } from "@/app/[locale]/(authenticated)/metrics/plugins/implementations/g-eval";
import { hallucinationMetric } from "@/app/[locale]/(authenticated)/metrics/plugins/implementations/hallucination";
import { asTuple } from "@/app/types/tuple";

export const metricPlugins = asTuple([
  gEvalMetric,
  answerRelevancyMetric,
  hallucinationMetric,
  faithfulnessMetric,
]);
