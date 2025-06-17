import { ComponentType, ReactElement } from "react";
import { Control, DefaultValues, FieldValues } from "react-hook-form";
import { z } from "zod";

import { QaCatalogGenerationData } from "@/app/client";
import { Translations } from "@/app/types/translations";
import { formErrors } from "@/app/utils/form-errors";

import { BaseQACatalogGenerationConfigurationForm } from "./base-qa-catalog-generation-form";

export type BaseQACatalogGenerationType = QaCatalogGenerationData["type"];

const baseConfigurationDataShape = {
  name: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  files: z
    .unknown()
    .transform((value) => {
      return value as unknown as FileList | null | undefined;
    })
    .refine((files) => files != null, {
      message: formErrors.required,
    }),
} satisfies z.ZodRawShape;

export type BaseConfigurationDataShape = typeof baseConfigurationDataShape;

type BaseShape<Type extends BaseQACatalogGenerationType> = {
  type: z.ZodLiteral<Type>;
} & typeof baseConfigurationDataShape;

export type PluginSchema<
  Type extends BaseQACatalogGenerationType,
  Shape extends z.ZodRawShape,
> = z.ZodObject<Shape & BaseShape<Type>>;

export type ConfigurationFormProps<
  Type extends BaseQACatalogGenerationType,
  Shape extends z.ZodRawShape,
> = {
  control: Control<z.input<PluginSchema<Type, Shape>>>;
};

export type QACatalogGenerationConfiguration<
  Type extends BaseQACatalogGenerationType,
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
};

export type QACatalogGenerationPlugin<
  Type extends BaseQACatalogGenerationType,
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
};

export const createQACatalogGenerationPlugin = <
  Type extends BaseQACatalogGenerationType,
  Shape extends z.ZodRawShape,
>({
  type,
  configurationDataShape,
  getDefaults,
  configurationForm: ConfigurationForm,
}: QACatalogGenerationConfiguration<Type, Shape>): QACatalogGenerationPlugin<
  Type,
  Shape
> => ({
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
  }),
  renderConfigurationForm: (control) => {
    return (
      <>
        <BaseQACatalogGenerationConfigurationForm<Type>
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
});
