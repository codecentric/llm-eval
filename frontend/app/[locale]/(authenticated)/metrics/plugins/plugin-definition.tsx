import { ComponentType, ReactElement } from "react";
import { Control, DefaultValues, FieldValues } from "react-hook-form";
import { SimplifyDeep } from "type-fest";
import { z } from "zod";

import { BaseMetricConfigurationForm } from "@/app/[locale]/(authenticated)/metrics/plugins/base-metric-configuration-form";
import {
  createListValueItem,
  PropertyListItem,
} from "@/app/[locale]/components/property-list";
import { LlmEndpoint, Metric, MetricConfigurationRead } from "@/app/client";
import { Translations } from "@/app/types/translations";
import { formErrors } from "@/app/utils/form-errors";
import { nullableInput, preprocessInputNumber } from "@/app/utils/zod";

export type BaseMetricType = MetricConfigurationRead["type"];

export type MetricDetailsData = {
  metric: Metric;
  endpoints?: LlmEndpoint[];
};

export type TypeMetric<Type extends BaseMetricType> = Omit<
  Metric,
  "configuration"
> & {
  configuration: Extract<MetricConfigurationRead, { type: Type }>;
};

const baseConfigurationDataShape = {
  name: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  threshold: z.preprocess(
    preprocessInputNumber,
    z
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .min(0, { message: formErrors.min(0) }),
  ),
  strictMode: z.boolean({ required_error: formErrors.required }),
} satisfies z.ZodRawShape;

export type BaseConfigurationDataShape = typeof baseConfigurationDataShape;

export const configurationDataWithChatModelShape = {
  chatModelId: nullableInput(
    z
      .string({ required_error: formErrors.required })
      .min(1, { message: formErrors.required }),
    formErrors.required,
  ),
} satisfies z.ZodRawShape;

type BaseShape<Type extends BaseMetricType> = {
  type: z.ZodLiteral<Type>;
} & typeof baseConfigurationDataShape;

export type PluginSchema<
  Type extends BaseMetricType,
  Shape extends z.ZodRawShape,
> = z.ZodObject<Shape & BaseShape<Type>>;

export type ConfigurationFormProps<
  Type extends BaseMetricType,
  Shape extends z.ZodRawShape,
> = {
  control: Control<z.input<PluginSchema<Type, Shape>>>;
};

export type MetricConfiguration<
  Type extends BaseMetricType,
  Shape extends z.ZodRawShape,
> = {
  type: Type;
  configurationDataShape: Shape;
  getDefaults: (
    t: Translations,
  ) => DefaultValues<
    z.input<z.ZodObject<Shape & Omit<BaseConfigurationDataShape, "name">>>
  >;
  configurationForm: ComponentType<ConfigurationFormProps<Type, Shape>>;
  getDetailItems: (
    metric: SimplifyDeep<TypeMetric<Type>>,
    t: Translations,
  ) => PropertyListItem[];
};

export type MetricPlugin<
  Type extends BaseMetricType,
  Shape extends z.ZodRawShape,
> = {
  type: Type;
  configurationDataSchema: PluginSchema<Type, Shape>;
  getDefaults: (
    t: Translations,
  ) => DefaultValues<z.input<PluginSchema<Type, Shape>>>;
  renderConfigurationForm: <T extends FieldValues>(
    control: Control<T>,
  ) => ReactElement<ConfigurationFormProps<Type, Shape>>;
  getDetailItems: (metric: Metric, t: Translations) => PropertyListItem[];
};

export const createMetricPlugin = <
  Type extends BaseMetricType,
  Shape extends z.ZodRawShape,
>({
  type,
  configurationDataShape,
  getDefaults,
  configurationForm: ConfigurationForm,
  getDetailItems,
}: MetricConfiguration<Type, Shape>): MetricPlugin<Type, Shape> => ({
  type,
  configurationDataSchema: z.object({
    ...configurationDataShape,
    ...baseConfigurationDataShape,
    type: z.literal(type),
  }),
  getDefaults: (t: Translations) => ({
    ...getDefaults(t),
    type,
    name: t(`metricType.${type}`),
  }),
  renderConfigurationForm: (control) => {
    return (
      <>
        <BaseMetricConfigurationForm<Type>
          control={
            control as unknown as Control<
              z.input<PluginSchema<Type, BaseConfigurationDataShape>>
            >
          }
        />
        <ConfigurationForm
          control={
            control as unknown as Control<z.input<PluginSchema<Type, Shape>>>
          }
        />
      </>
    );
  },
  getDetailItems: (metric, t) => [
    createListValueItem({
      label: t("MetricDetails.labels.threshold"),
      value: metric.configuration.threshold,
    }),
    createListValueItem({
      label: t("MetricDetails.labels.strictMode"),
      value: metric.configuration.strictMode,
    }),
    ...(isTypeMetricDetailsData(type, metric) ? getDetailItems(metric, t) : []),
  ],
});

function isTypeMetricDetailsData<Type extends BaseMetricType>(
  type: Type,
  metric: Metric,
): metric is SimplifyDeep<TypeMetric<Type>> {
  return metric.configuration.type === type;
}
