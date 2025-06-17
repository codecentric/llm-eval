import { MetricConfigurationRead } from "@/app/client";

export function hasMetricType<Types extends MetricConfigurationRead["type"][]>(
  configuration: MetricConfigurationRead,
  types: Types,
): configuration is Extract<
  MetricConfigurationRead,
  {
    type: Types[number];
  }
> {
  return types.includes(configuration.type);
}
