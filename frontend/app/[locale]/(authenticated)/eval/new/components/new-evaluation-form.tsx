import { Divider } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control } from "react-hook-form";
import { z } from "zod";

import { LlmEndpointAutocomplete } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-autocomplete";
import { newMetricPage } from "@/app/[locale]/(authenticated)/metrics/new/page-info";
import { QaCatalogAutocomplete } from "@/app/[locale]/(authenticated)/qa-catalogs/components/qa-catalog-autocomplete";
import { FormAutocomplete } from "@/app/[locale]/components/form-autocomplete";
import { FormCheckboxGroup } from "@/app/[locale]/components/form-checkbox-group";
import { FormInput } from "@/app/[locale]/components/form-input";
import { Metric, PluginFeature } from "@/app/client";
import { NavigationLink } from "@/app/components/navigation-link";
import { formErrors } from "@/app/utils/form-errors";
import { nullableInput } from "@/app/utils/zod";

export const newEvaluationSchema = z.object({
  executionName: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
  catalogId: nullableInput(
    z
      .string({ required_error: formErrors.required })
      .min(1, { message: formErrors.required }),
    formErrors.required,
  ),
  endpointId: nullableInput(
    z
      .string({ required_error: formErrors.required })
      .min(1, { message: formErrors.required }),
    formErrors.required,
  ),
  numberOfTestCases: z.coerce
    .number({
      required_error: formErrors.required,
      invalid_type_error: formErrors.nan,
    })
    .min(1, { message: formErrors.min(1) }),
  metrics: z
    .array(z.string({ required_error: formErrors.required }))
    .nonempty({ message: formErrors.selectMin(1) }),
});

const MetricCheckboxContent: React.FC<{ item: Metric }> = ({
  item: metric,
}) => {
  const t = useTranslations();

  return (
    <div className="w-full">
      <div className="text-lg whitespace-nowrap overflow-hidden text-ellipsis">
        {metric.configuration.name}
      </div>
      <div className="text-sm italic text-secondary">
        {t(`metricType.${metric.configuration.type}`)}
      </div>
    </div>
  );
};

export type NewEvaluationFormProps = {
  control: Control<z.input<typeof newEvaluationSchema>>;
  catalogLocked?: boolean;
  availableMetrics: Metric[];
};

export const NewEvaluationForm = ({
  control,
  catalogLocked,
  availableMetrics,
}: NewEvaluationFormProps) => {
  const t = useTranslations();

  const metricCheckboxItems = useMemo(
    () =>
      availableMetrics.map((metric) => ({
        value: metric.id,
        rawItem: metric,
      })),
    [availableMetrics],
  );

  return (
    <>
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="executionName"
        label={t("NewEvaluationForm.field.executionName.label")}
        className="col-span-2"
      />
      <FormAutocomplete
        variant="bordered"
        isRequired
        control={control}
        name="catalogId"
        className="col-start-1"
        label={t("NewEvaluationForm.field.catalogId.label")}
        placeholder={t("NewEvaluationForm.field.catalogId.placeholder")}
        component={QaCatalogAutocomplete}
        isDisabled={catalogLocked}
      />
      <FormAutocomplete
        variant="bordered"
        isRequired
        control={control}
        name="endpointId"
        label={t("NewEvaluationForm.field.endpointId.label")}
        placeholder={t("NewEvaluationForm.field.endpointId.placeholder")}
        supportedFeatures={[PluginFeature.LLM_QUERY]}
        component={LlmEndpointAutocomplete}
      />
      <FormInput
        variant="bordered"
        isRequired
        control={control}
        name="numberOfTestCases"
        label={t("NewEvaluationForm.field.numberOfTestCases.label")}
        className="col-start-1"
      />
      <Divider className="col-start-1 col-span-2" />
      <FormCheckboxGroup
        isRequired
        className="col-span-2"
        control={control}
        name="metrics"
        items={metricCheckboxItems}
        checkboxContent={MetricCheckboxContent}
        label={t("NewEvaluationForm.field.metrics.label")}
        emptyMessage={t.rich("NewEvaluationForm.field.metrics.empty", {
          newLink: (chunks) => (
            <NavigationLink href={newMetricPage.href}>{chunks}</NavigationLink>
          ),
        })}
      />
    </>
  );
};
