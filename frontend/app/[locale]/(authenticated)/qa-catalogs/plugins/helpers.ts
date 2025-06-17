import { TupleToUnion } from "type-fest";
import { z } from "zod";

import { ActiveQaCatalogGeneratorType } from "@/app/client";

import { QACatalogGenerationPlugin } from "./plugin-definition";
import { generatorPlugins } from "./plugins";

type PluginType = (typeof generatorPlugins)[number];

type ImplementationField<T, Field extends keyof PluginType> =
  T extends QACatalogGenerationPlugin<infer Type, infer Schema>
    ? QACatalogGenerationPlugin<Type, Schema>[Field]
    : never;
type MapImplementationField<
  Implementations extends [...unknown[]],
  Field extends keyof PluginType,
> = {
  [K in keyof Implementations]: ImplementationField<Implementations[K], Field>;
};

const mapPluginField = <Field extends keyof PluginType>(field: Field) =>
  generatorPlugins.map((impl) => impl[field]) as MapImplementationField<
    typeof generatorPlugins,
    Field
  >;

export const catalogGeneratorConfigurationSchema = z.discriminatedUnion(
  "type",
  mapPluginField("configurationDataSchema"),
);

export const supportedCatalogGeneratorTypes = mapPluginField("type");

export function filterSupportedGeneratorTypes(
  endpointTypes: ActiveQaCatalogGeneratorType[],
): ActiveQaCatalogGeneratorType[] {
  return endpointTypes.filter((endpointType) =>
    supportedCatalogGeneratorTypes.some(
      (supportedType) => supportedType === endpointType.type,
    ),
  );
}

export type SupportedQACatalogGeneratorType = TupleToUnion<
  typeof supportedCatalogGeneratorTypes
>;

export type CatalogGeneratorPluginFromType<
  Type extends SupportedQACatalogGeneratorType,
> = Extract<TupleToUnion<typeof generatorPlugins>, { type: Type }>;
