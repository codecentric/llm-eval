import { Control } from "react-hook-form";
import { z } from "zod";

import {
  metricConfigurationDataSchema,
  MetricType,
} from "@/app/[locale]/(authenticated)/metrics/plugins";
import { useMetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins/use-metric-plugin";

export type MetricConfigurationFormProps<Type extends MetricType> = {
  metricType?: Type;
  control: Control<z.input<typeof metricConfigurationDataSchema>>;
};

export const MetricConfigurationForm = <Type extends MetricType>({
  metricType,
  control,
}: MetricConfigurationFormProps<Type>) => {
  const metricImplementation = useMetricPlugin(metricType);

  if (!metricImplementation) {
    return null;
  }

  const { renderConfigurationForm } = metricImplementation;

  return renderConfigurationForm(control);
};
