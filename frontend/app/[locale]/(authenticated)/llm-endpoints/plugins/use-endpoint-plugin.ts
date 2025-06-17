import {
  EndpointPluginFromType,
  SupportedLlmEndpointType,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/helpers";
import { endpointPlugins } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugins";

export const useEndpointPlugin = <Type extends SupportedLlmEndpointType>(
  metricType?: Type,
) => {
  return endpointPlugins.find(
    (impl): impl is EndpointPluginFromType<Type> => impl.type === metricType,
  );
};

export const getEndpointPlugin = useEndpointPlugin;
