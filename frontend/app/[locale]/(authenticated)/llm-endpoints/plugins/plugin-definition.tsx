import { ComponentType, ReactElement } from "react";
import { Control, DefaultValues, FieldValues } from "react-hook-form";
import { SimplifyDeep } from "type-fest";
import { z } from "zod";

import { BaseEndpointConfigurationForm } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/base-endpoint-configuration-form";
import {
  createListValueItem,
  PropertyListItem,
} from "@/app/[locale]/components/property-list";
import { LlmEndpoint, LlmEndpointConfigurationRead } from "@/app/client";
import { Translations } from "@/app/types/translations";
import { formErrors } from "@/app/utils/form-errors";
import { preprocessInputNumber } from "@/app/utils/zod";

export type BaseEndpointType = LlmEndpointConfigurationRead["type"];

export type TypeEndpoint<Type extends BaseEndpointType> = Omit<
  LlmEndpoint,
  "configuration"
> & {
  configuration: Extract<LlmEndpointConfigurationRead, { type: Type }>;
};

const baseConfigurationDataShape = {
  name: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  parallelQueries: z.preprocess(
    preprocessInputNumber,
    z
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .int({ message: formErrors.int })
      .min(1, { message: formErrors.min(1) }),
  ),
  maxRetries: z.preprocess(
    preprocessInputNumber,
    z
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .int({ message: formErrors.int })
      .min(0, { message: formErrors.min(0) }),
  ),
  requestTimeout: z.preprocess(
    preprocessInputNumber,
    z
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .int({ message: formErrors.int })
      .min(1, { message: formErrors.min(1) }),
  ),
} satisfies z.ZodRawShape;

export type BaseConfigurationDataShape = typeof baseConfigurationDataShape;

type BaseShape<Type extends BaseEndpointType> = {
  type: z.ZodLiteral<Type>;
} & typeof baseConfigurationDataShape;

export type PluginSchema<
  Type extends BaseEndpointType,
  Shape extends z.ZodRawShape,
> = z.ZodObject<Shape & BaseShape<Type>>;

export type ConfigurationFormProps<
  Type extends BaseEndpointType,
  Shape extends z.ZodRawShape,
> = {
  control: Control<z.input<PluginSchema<Type, Shape>>>;
};

export type LlmEndpointConfiguration<
  Type extends BaseEndpointType,
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
    detailsData: SimplifyDeep<TypeEndpoint<Type>>,
    t: Translations,
  ) => PropertyListItem[];
};

export type LlmEndpointPlugin<
  Type extends BaseEndpointType,
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
  getDetailItems: (
    detailsData: LlmEndpoint,
    t: Translations,
  ) => PropertyListItem[];
};

export const createLlmEndpointPlugin = <
  Type extends BaseEndpointType,
  Shape extends z.ZodRawShape,
>({
  type,
  configurationDataShape,
  getDefaults,
  configurationForm: ConfigurationForm,
  getDetailItems,
}: LlmEndpointConfiguration<Type, Shape>): LlmEndpointPlugin<Type, Shape> => ({
  type,
  configurationDataSchema: z.object({
    ...configurationDataShape,
    ...baseConfigurationDataShape,
    type: z.literal(type),
  }),
  getDefaults: (t: Translations) => ({
    ...getDefaults(t),
    type,
    name: "",
    maxRetries: 10,
    parallelQueries: 5,
    requestTimeout: 60,
  }),
  renderConfigurationForm: (control) => {
    return (
      <>
        <BaseEndpointConfigurationForm<Type>
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
  getDetailItems: (endpoint, t) => [
    createListValueItem({
      label: t("LlmEndpointDetails.labels.parallelQueries"),
      value: endpoint.configuration.parallelQueries,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.maxRetries"),
      value: endpoint.configuration.maxRetries,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.requestTimeout"),
      value: t("duration.seconds", {
        value: endpoint.configuration.requestTimeout,
      }),
      fullWidth: true,
    }),
    ...(isTypeMetricDetailsData(type, endpoint)
      ? getDetailItems(endpoint, t)
      : []),
  ],
});

function isTypeMetricDetailsData<Type extends BaseEndpointType>(
  type: Type,
  endpoint: LlmEndpoint,
): endpoint is SimplifyDeep<TypeEndpoint<Type>> {
  return endpoint.configuration.type === type;
}
