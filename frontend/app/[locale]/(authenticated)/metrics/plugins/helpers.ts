import { TupleToUnion } from "type-fest";
import { z } from "zod";

import { MetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins/plugin-definition";
import { metricPlugins } from "@/app/[locale]/(authenticated)/metrics/plugins/plugins";

type PluginType = (typeof metricPlugins)[number];

type ImplementationField<T, Field extends keyof PluginType> =
  T extends MetricPlugin<infer Type, infer Schema>
    ? MetricPlugin<Type, Schema>[Field]
    : never;
type MapImplementationField<
  Implementations extends [...unknown[]],
  Field extends keyof PluginType,
> = {
  [K in keyof Implementations]: ImplementationField<Implementations[K], Field>;
};

const mapPluginField = <Field extends keyof PluginType>(field: Field) =>
  metricPlugins.map((impl) => impl[field]) as MapImplementationField<
    typeof metricPlugins,
    Field
  >;

export const metricConfigurationDataSchema = z.discriminatedUnion(
  "type",
  mapPluginField("configurationDataSchema"),
);

export const supportedMetricTypes = mapPluginField("type");

export function filterSupportedMetricTypes(metricTypes: string[]) {
  return metricTypes.filter((metricType): metricType is MetricType =>
    supportedMetricTypes.some((supportedType) => supportedType === metricType),
  );
}

export type MetricType = TupleToUnion<typeof supportedMetricTypes>;

export type MetricPluginFromType<Type extends MetricType> = Extract<
  TupleToUnion<typeof metricPlugins>,
  { type: Type }
>;
