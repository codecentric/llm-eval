import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  CheckboxGroup,
  Textarea,
} from "@heroui/react";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import { Controller, useController, useFieldArray } from "react-hook-form";
import { MdAdd, MdRemove } from "react-icons/md";
import { z } from "zod";

import { LlmEndpointAutocomplete } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-autocomplete";
import {
  ConfigurationFormProps,
  createQACatalogGenerationPlugin,
} from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/plugin-definition";
import { FormAutocomplete } from "@/app/[locale]/components/form-autocomplete";
import { FormInput } from "@/app/[locale]/components/form-input";
import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";
import { RagasQaCatalogQuerySynthesizer } from "@/app/client";
import { formErrors } from "@/app/utils/form-errors";
import { nullableInput } from "@/app/utils/zod";

const synthesizerTypes = Object.values(RagasQaCatalogQuerySynthesizer) as [
  RagasQaCatalogQuerySynthesizer,
  ...RagasQaCatalogQuerySynthesizer[],
];

const synthesizerTypeEnum = z.enum(synthesizerTypes);

const getDefaultSynthesizerValues = (): RagasQaCatalogQuerySynthesizer[] => [
  RagasQaCatalogQuerySynthesizer.SINGLE_HOP_SPECIFIC,
];

const ragasGeneratorConfigurationShape = {
  config: z.object({
    sampleCount: z.coerce
      .number({
        required_error: formErrors.required,
        invalid_type_error: formErrors.nan,
      })
      .int({ message: formErrors.int })
      .min(1, { message: formErrors.required }),
    queryDistribution: z
      .array(synthesizerTypeEnum)
      .min(1, { message: "At least one query synthesizer must be selected" }),
    personas: z
      .array(
        z.object({
          name: z.string().min(1, { message: formErrors.required }),
          description: z.string().min(5, { message: formErrors.required }),
        }),
      )
      .nullable(),
  }),
  modelConfig: z.object({
    llmEndpoint: nullableInput(
      z
        .string({ required_error: formErrors.required })
        .min(1, { message: formErrors.required }),
      formErrors.required,
    ),
  }),
} satisfies z.ZodRawShape;

const PersonaListForm = ({
  control,
}: ConfigurationFormProps<
  "RAGAS",
  typeof ragasGeneratorConfigurationShape
>) => {
  const t = useTranslations();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config.personas",
  });
  const {
    fieldState: { invalid: personasInvalid },
  } = useController({
    control: control,
    name: "config.personas",
  });

  const errorMessageBuilder = useFormFieldErrorMessageBuilder();

  return (
    <div
      className={cx(
        personasInvalid ? "border-danger" : "border-default-200",
        "flex flex-col space-y-3 col-span-2 hover:border-default-400 border-medium rounded-medium border-solid py-2 px-3 mb-3",
      )}
    >
      <div className="flex flex-row justify-between">
        <div className="text-default-600 scale-90 origin-top-left">
          {t("RagasQACatalogGeneratorConfigurationForm.field.personas.header")}
        </div>
        <Button
          className="col-span-1"
          size="sm"
          isIconOnly
          onPress={() =>
            append({
              name: "",
              description: "",
            })
          }
          data-testid="add-button"
        >
          <MdAdd />
        </Button>
      </div>
      {!fields.length && (
        <div className="text-default-400 scale-90 origin-top-left">
          {t(
            "RagasQACatalogGeneratorConfigurationForm.field.personas.emptyDescription",
          )}
        </div>
      )}
      {fields.map((item, index) => (
        <div key={item.id} className="flex flex-row space-x-3">
          <FormInput
            control={control}
            label={t(
              "RagasQACatalogGeneratorConfigurationForm.field.personas.fields.persona.name.label",
            )}
            placeholder={t(
              "RagasQACatalogGeneratorConfigurationForm.field.personas.fields.persona.name.placeholder",
            )}
            name={`config.personas.${index}.name`}
          />
          <Controller
            control={control}
            name={`config.personas.${index}.description`}
            render={({ field, fieldState }) => {
              const errorMessage = errorMessageBuilder(fieldState.error, index);
              return (
                <Textarea
                  required
                  label={t(
                    "RagasQACatalogGeneratorConfigurationForm.field.personas.fields.persona.description.label",
                  )}
                  placeholder={t(
                    "RagasQACatalogGeneratorConfigurationForm.field.personas.fields.persona.description.placeholder",
                  )}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  onBlur={field.onBlur}
                  errorMessage={errorMessage}
                  isInvalid={!!errorMessage}
                />
              );
            }}
          />
          <Button
            size="sm"
            isIconOnly
            color="danger"
            variant="flat"
            onPress={() => remove(index)}
            data-testid={"remove-button"}
          >
            <MdRemove />
          </Button>
        </div>
      ))}
    </div>
  );
};

const QueryDistributionForm = ({
  control,
}: ConfigurationFormProps<
  "RAGAS",
  typeof ragasGeneratorConfigurationShape
>) => {
  const t = useTranslations();

  const {
    fieldState: { error: distributionError, invalid: queryDistributionInvalid },
  } = useController({
    control: control,
    name: "config.queryDistribution",
  });

  return (
    <div
      className={cx(
        queryDistributionInvalid ? "border-danger" : "border-default-200",
        "flex flex-col space-y-3 col-span-2 hover:border-default-400 border-medium rounded-medium border-solid py-2 px-3",
      )}
    >
      <div className="flex flex-col">
        <span className="text-default-600 scale-90 origin-top-left">
          {t(
            "RagasQACatalogGeneratorConfigurationForm.field.queryDistribution.header",
          )}
        </span>
        <span className="text-default-500 scale-85 origin-top-left">
          {t(
            "RagasQACatalogGeneratorConfigurationForm.field.queryDistribution.description",
          )}
        </span>
      </div>
      <div className="flex flex-col space-y-3">
        <Controller
          name="config.queryDistribution"
          control={control}
          render={({ field }) => (
            <CheckboxGroup
              value={field.value}
              onValueChange={field.onChange}
              orientation="vertical"
              color="primary"
              isInvalid={queryDistributionInvalid}
              errorMessage={distributionError?.message}
            >
              {synthesizerTypes.map((synth) => (
                <div key={synth} className="flex flex-col space-y-1">
                  <Checkbox
                    value={synth}
                    data-testid={`queryDistributionCheckbox-${synth}`}
                  >
                    {t(
                      `RagasQACatalogGeneratorConfigurationForm.field.queryDistribution.values.${synth}.title`,
                    )}
                  </Checkbox>
                  <span className="text-default-500 text-sm ml-6">
                    {t(
                      `RagasQACatalogGeneratorConfigurationForm.field.queryDistribution.values.${synth}.description`,
                    )}
                  </span>
                </div>
              ))}
            </CheckboxGroup>
          )}
        />
      </div>
    </div>
  );
};

const RagasGeneratorConfigurationForm = ({
  control,
}: ConfigurationFormProps<
  "RAGAS",
  typeof ragasGeneratorConfigurationShape
>) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col col-span-2 space-y-3 overflow-hidden">
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="config.sampleCount"
        label={t(
          "RagasQACatalogGeneratorConfigurationForm.field.sampleCount.label",
        )}
        className="col-span-2"
      />
      <FormAutocomplete
        variant="bordered"
        isRequired
        control={control}
        name="modelConfig.llmEndpoint"
        className="col-span-2"
        label={t(
          "RagasQACatalogGeneratorConfigurationForm.field.llmEndpointId.label",
        )}
        placeholder={t(
          "RagasQACatalogGeneratorConfigurationForm.field.llmEndpointId.placeholder",
        )}
        component={LlmEndpointAutocomplete}
      />
      <Accordion className="col-span-2 px-0" variant="light" keepContentMounted>
        <AccordionItem
          key="1"
          aria-label={t(
            "RagasQACatalogGeneratorConfigurationForm.toggleAdvancedConfiguration",
          )}
          title={t(
            "RagasQACatalogGeneratorConfigurationForm.toggleAdvancedConfiguration",
          )}
          className="col-span-2"
        >
          <PersonaListForm control={control} />
          <QueryDistributionForm control={control} />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export const ragasGeneratorPlugin = createQACatalogGenerationPlugin({
  type: "RAGAS",
  configurationDataShape: ragasGeneratorConfigurationShape,
  configurationForm: RagasGeneratorConfigurationForm,
  getDefaults: () => ({
    config: {
      type: "RAGAS" as const,
      sampleCount: 5,
      queryDistribution: getDefaultSynthesizerValues(),
      personas: [],
      knowledgeGraphLocation: null,
      useExistingKnowledgeGraph: true,
    },
    modelConfig: { llmEndpoint: null },
  }),
});
