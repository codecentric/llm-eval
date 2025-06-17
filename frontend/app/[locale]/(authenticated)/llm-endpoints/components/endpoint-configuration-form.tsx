import { Control } from "react-hook-form";
import { z } from "zod";

import {
  endpointConfigurationDataSchema,
  SupportedLlmEndpointType,
  useEndpointPlugin,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins";

export type EndpointConfigurationFormProps<
  Type extends SupportedLlmEndpointType,
> = {
  endpointType?: Type;
  control: Control<z.input<typeof endpointConfigurationDataSchema>>;
  isDisabled?: boolean;
};

export const EndpointConfigurationForm = <
  Type extends SupportedLlmEndpointType,
>({
  endpointType,
  control,
}: EndpointConfigurationFormProps<Type>) => {
  const endpointPlugin = useEndpointPlugin(endpointType);

  if (!endpointPlugin) {
    return null;
  }

  return endpointPlugin.renderConfigurationForm(control);
};
