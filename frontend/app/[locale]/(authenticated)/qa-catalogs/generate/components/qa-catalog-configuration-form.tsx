import { Control } from "react-hook-form";
import { z } from "zod";

import {
  catalogGeneratorConfigurationSchema,
  SupportedQACatalogGeneratorType,
} from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/helpers";
import { useCatalogGeneratorPlugin } from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/use-catalog-generator-plugin";

export type QACatalogGeneratorConfigurationFormProps<
  Type extends SupportedQACatalogGeneratorType,
> = {
  generatorType?: Type;
  control: Control<z.infer<typeof catalogGeneratorConfigurationSchema>>;
  isDisabled?: boolean;
};

export const QACatalogGeneratorConfigurationForm = <
  Type extends SupportedQACatalogGeneratorType,
>({
  generatorType,
  control,
}: QACatalogGeneratorConfigurationFormProps<Type>) => {
  const generatorPlugin = useCatalogGeneratorPlugin(generatorType);

  if (!generatorPlugin) {
    return null;
  }

  return generatorPlugin.renderConfigurationForm(control);
};
