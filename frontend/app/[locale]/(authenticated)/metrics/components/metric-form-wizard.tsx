"use client";

import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { MetricConfigurationForm } from "@/app/[locale]/(authenticated)/metrics/components/metric-configuration-form";
import {
  MetricTypeSelectionForm,
  metricTypeSelectionSchema,
} from "@/app/[locale]/(authenticated)/metrics/components/metric-type-selection-form";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import {
  getMetricPlugin,
  metricConfigurationDataSchema,
} from "@/app/[locale]/(authenticated)/metrics/plugins";
import {
  METRIC_QUERY_BASE_KEY,
  METRICS_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/metrics/queries";
import {
  FormWizard,
  State,
  SubmitData,
} from "@/app/[locale]/components/form-wizard";
import {
  Metric,
  MetricCreate,
  metricsPatch,
  metricsPost,
  MetricUpdate,
} from "@/app/client";
import { EditOrigin } from "@/app/types/edit-origin";
import { callApi } from "@/app/utils/backend-client/client";
import { useRouter } from "@/i18n/routing";

const schemas = {
  type: metricTypeSelectionSchema,
  configuration: metricConfigurationDataSchema,
};

export type MetricFormWizardProps = {
  metricTypes: string[];
  metric?: Metric;
  origin?: EditOrigin;
};

export const MetricFormWizard = ({
  metricTypes,
  metric,
  origin = EditOrigin.DETAILS,
}: MetricFormWizardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: create, isPending: creating } = useMutation({
    mutationKey: ["createMetric"],
    mutationFn: (createData: MetricCreate) =>
      callApi(metricsPost<true>, { body: createData }),
    onSuccess: async ({ id, configuration: { name } }) => {
      addToast({
        title: t("MetricFormWizard.create.success", { name }),
        color: "success",
      });

      await queryClient.invalidateQueries({
        queryKey: [METRICS_QUERY_BASE_KEY],
      });

      router.push(metricDetailsPage(id).href);
    },
    onError: (error) => {
      addToast({
        title: error.message,
        color: "danger",
      });
    },
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationKey: ["updateMetric"],
    mutationFn: ({
      metricId,
      updateData,
    }: {
      metricId: string;
      updateData: MetricUpdate;
    }) =>
      callApi(metricsPatch<true>, {
        path: {
          metric_id: metricId,
        },
        body: updateData,
      }),
    onSuccess: async ({ id, configuration: { name } }) => {
      addToast({
        title: t("MetricFormWizard.update.success", { name }),
        color: "success",
      });

      await queryClient.invalidateQueries({
        queryKey: [METRICS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [METRIC_QUERY_BASE_KEY, id],
      });

      router.push(metricDetailsPage(id).href);
    },
    onError: (error) => {
      addToast({
        title: error.message,
        color: "danger",
      });
    },
  });

  const onSubmit = useCallback(
    (data: SubmitData<typeof schemas>) => {
      if (metric) {
        const updateData: MetricUpdate = {
          configuration: data.configuration,
          version: metric.version,
        };

        update({ metricId: metric.id, updateData });
      } else {
        const createData: MetricCreate = {
          configuration: data.configuration,
        };

        create(createData);
      }
    },
    [metric, create, update],
  );

  const onCancel = useCallback(() => {
    if (metric && origin === EditOrigin.DETAILS) {
      router.push(metricDetailsPage(metric.id).href);
    } else {
      router.push(metricsPage.href);
    }
  }, [router, metric, origin]);

  const initialState = useMemo<State<typeof schemas> | undefined>(
    () =>
      metric && {
        type: {
          metricType: metric.configuration.type,
        },
        configuration: metric.configuration,
      },
    [metric],
  );

  return (
    <FormWizard
      schemas={schemas}
      onSubmit={onSubmit}
      onCancel={onCancel}
      globalSubmit={!!metric}
      submitLabel={t(
        `MetricFormWizard.submitLabel.${metric ? "update" : "create"}`,
      )}
      loading={updating || creating}
      initialState={initialState}
      pages={[
        {
          key: "type",
          name: t("MetricFormWizard.tab.type"),
          render: ({ control }) => (
            <MetricTypeSelectionForm
              metricTypes={metricTypes}
              control={control}
            />
          ),
          defaultValues: () => ({
            metricType: undefined,
          }),
          onStateChange: ({ state, clearPageState }) => {
            if (
              state.configuration?.type &&
              state.configuration.type !== state.type?.metricType
            ) {
              clearPageState("configuration");
            }
          },
        },
        {
          key: "configuration",
          name: t("MetricFormWizard.tab.configuration"),
          render: ({ control, state }) => (
            <MetricConfigurationForm
              control={control}
              metricType={state.type?.metricType}
            />
          ),
          defaultValues: (state) => {
            const metricImplementation = getMetricPlugin(
              state.type?.metricType,
            );

            return metricImplementation
              ? metricImplementation.getDefaults(t)
              : {};
          },
        },
      ]}
    />
  );
};
