import {
  MetricPluginFromType,
  MetricType,
} from "@/app/[locale]/(authenticated)/metrics/plugins/helpers";
import { metricPlugins } from "@/app/[locale]/(authenticated)/metrics/plugins/plugins";

export const useMetricPlugin = <Type extends MetricType>(metricType?: Type) => {
  return metricPlugins.find(
    (impl): impl is MetricPluginFromType<Type> => impl.type === metricType,
  );
};

export const getMetricPlugin = useMetricPlugin;
