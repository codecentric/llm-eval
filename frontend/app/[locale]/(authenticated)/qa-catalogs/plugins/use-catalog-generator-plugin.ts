import {
  CatalogGeneratorPluginFromType,
  SupportedQACatalogGeneratorType,
} from "./helpers";
import { generatorPlugins } from "./plugins";

export const useCatalogGeneratorPlugin = <
  Type extends SupportedQACatalogGeneratorType,
>(
  generatorType?: Type,
) => {
  return generatorPlugins.find(
    (impl): impl is CatalogGeneratorPluginFromType<Type> =>
      impl.type === generatorType,
  );
};

export const getCatalogGeneratorPlugin = useCatalogGeneratorPlugin;
