import { TupleToUnion } from "type-fest";
import { z } from "zod";

import { LlmEndpointPlugin } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugin-definition";
import { endpointPlugins } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/plugins";
import { LlmEndpointType } from "@/app/client";

type PluginType = (typeof endpointPlugins)[number];

type ImplementationField<T, Field extends keyof PluginType> =
  T extends LlmEndpointPlugin<infer Type, infer Schema>
    ? LlmEndpointPlugin<Type, Schema>[Field]
    : never;
type MapImplementationField<
  Implementations extends [...unknown[]],
  Field extends keyof PluginType,
> = {
  [K in keyof Implementations]: ImplementationField<Implementations[K], Field>;
};

const mapPluginField = <Field extends keyof PluginType>(field: Field) =>
  endpointPlugins.map((impl) => impl[field]) as MapImplementationField<
    typeof endpointPlugins,
    Field
  >;

export const endpointConfigurationDataSchema = z.discriminatedUnion(
  "type",
  mapPluginField("configurationDataSchema"),
);

export const supportedEndpointTypes = mapPluginField("type");

export function filterSupportedEndpointTypes(endpointTypes: LlmEndpointType[]) {
  return endpointTypes.filter((endpointType) =>
    supportedEndpointTypes.some(
      (supportedType) => supportedType === endpointType.name,
    ),
  );
}

export type SupportedLlmEndpointType = TupleToUnion<
  typeof supportedEndpointTypes
>;

export type EndpointPluginFromType<Type extends SupportedLlmEndpointType> =
  Extract<TupleToUnion<typeof endpointPlugins>, { type: Type }>;
