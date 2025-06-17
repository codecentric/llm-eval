"use client";

import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { EndpointConfigurationForm } from "@/app/[locale]/(authenticated)/llm-endpoints/components/endpoint-configuration-form";
import {
  EndpointTypeSelectionForm,
  endpointTypeSelectionSchema,
} from "@/app/[locale]/(authenticated)/llm-endpoints/components/endpoint-type-selection-form";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import {
  endpointConfigurationDataSchema,
  getEndpointPlugin,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins";
import {
  LLM_ENDPOINT_QUERY_BASE_KEY,
  LLM_ENDPOINTS_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { FormWizard, SubmitData } from "@/app/[locale]/components/form-wizard";
import {
  LlmEndpoint,
  LlmEndpointConfigurationUpdate,
  LlmEndpointCreate,
  llmEndpointsPatch,
  llmEndpointsPost,
  LlmEndpointType,
  LlmEndpointUpdate,
} from "@/app/client";
import { EditOrigin } from "@/app/types/edit-origin";
import { callApi } from "@/app/utils/backend-client/client";
import { useRouter } from "@/i18n/routing";

export const UNCHANGED_API_KEY = "d1d04d4e-38b9-441c-a6e3-68fb1e18f0c0";

const nullToUnset = <Update extends LlmEndpointConfigurationUpdate>(
  configuration: Update,
  defaults?: Update,
): Update =>
  Object.fromEntries(
    (Object.entries(configuration) as [keyof Update, unknown][]).map(
      ([key, value]) =>
        key === "type"
          ? [key, value]
          : [
              key,
              defaults && value === defaults[key]
                ? null
                : value === null
                  ? "UNSET_VALUE"
                  : value,
            ],
    ),
  ) as Update;

const schemas = {
  endpointType: endpointTypeSelectionSchema,
  configuration: endpointConfigurationDataSchema,
};

export type LlmEndpointFormWizardProps = {
  endpointTypes: LlmEndpointType[];
  llmEndpoint?: LlmEndpoint;
  origin?: EditOrigin;
};

export const LlmEndpointFormWizard = ({
  endpointTypes,
  llmEndpoint,
  origin = EditOrigin.DETAILS,
}: LlmEndpointFormWizardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: create, isPending: creating } = useMutation({
    mutationKey: ["createLlmEndpoint"],
    mutationFn: (createData: LlmEndpointCreate) =>
      callApi(llmEndpointsPost<true>, {
        body: createData,
      }),
    onSuccess: async ({ id, name }) => {
      addToast({
        title: t("LlmEndpointFormWizard.create.success", { name }),
        color: "success",
      });

      await queryClient.invalidateQueries({
        queryKey: [LLM_ENDPOINTS_QUERY_BASE_KEY],
      });

      router.push(llmEndpointDetailsPage(id).href);
    },
    onError: (error) => {
      addToast({
        title: error.message,
        color: "danger",
      });
    },
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationKey: ["updateLlmEndpoint"],
    mutationFn: ({
      endpointId,
      updateData,
    }: {
      endpointId: string;
      updateData: LlmEndpointUpdate;
    }) =>
      callApi(llmEndpointsPatch<true>, {
        path: {
          llm_endpoint_id: endpointId,
        },
        body: updateData,
      }),
    onSuccess: async ({ id, name }) => {
      addToast({
        title: t("LlmEndpointFormWizard.update.success", { name }),
        color: "success",
      });

      await queryClient.invalidateQueries({
        queryKey: [LLM_ENDPOINTS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [LLM_ENDPOINT_QUERY_BASE_KEY, id],
      });

      router.push(llmEndpointDetailsPage(id).href);
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
      const { name, ...configuration } = data.configuration;

      if (llmEndpoint) {
        const updateConfig: LlmEndpointConfigurationUpdate = nullToUnset(
          configuration,
          {
            ...llmEndpoint.configuration,
            apiKey: UNCHANGED_API_KEY,
          },
        );

        const updateData: LlmEndpointUpdate = {
          name,
          configuration: updateConfig,
          version: llmEndpoint.version,
        };

        update({ endpointId: llmEndpoint.id, updateData });
      } else {
        const createData: LlmEndpointCreate = {
          name,
          configuration,
        };

        create(createData);
      }
    },
    [llmEndpoint, update, create],
  );

  const initialState = useMemo(
    () =>
      llmEndpoint && {
        endpointType: { endpointType: llmEndpoint.configuration.type },
        configuration: {
          ...llmEndpoint.configuration,
          name: llmEndpoint.name,
          apiKey: UNCHANGED_API_KEY,
        },
      },
    [llmEndpoint],
  );

  const onCancel = useCallback(() => {
    if (llmEndpoint && origin === EditOrigin.DETAILS) {
      router.push(llmEndpointDetailsPage(llmEndpoint.id).href);
    } else {
      router.push(llmEndpointsPage.href);
    }
  }, [router, llmEndpoint, origin]);

  return (
    <FormWizard
      schemas={schemas}
      initialState={initialState}
      onSubmit={onSubmit}
      onCancel={onCancel}
      globalSubmit={!!llmEndpoint}
      submitLabel={t(
        `LLMEndpointForm.submitLabel.${llmEndpoint ? "update" : "create"}`,
      )}
      loading={creating || updating}
      pages={[
        {
          key: "endpointType",
          name: t("LLMEndpointForm.tab.type"),
          render: ({ control, loading }) => (
            <EndpointTypeSelectionForm
              control={control}
              endpointTypes={endpointTypes}
              isDisabled={loading}
            />
          ),
          defaultValues: () => ({
            endpointType: undefined,
          }),
          onStateChange: ({ state, clearPageState }) => {
            if (
              state.configuration?.type &&
              state.configuration.type !== state.endpointType?.endpointType
            ) {
              clearPageState("configuration");
            }
          },
        },
        {
          key: "configuration",
          name: t("LLMEndpointForm.tab.configuration"),
          render: ({ control, state, loading }) => (
            <EndpointConfigurationForm
              endpointType={state.endpointType?.endpointType}
              control={control}
              isDisabled={loading}
            />
          ),
          defaultValues: (state) => {
            const endpointPlugin = getEndpointPlugin(
              state.endpointType?.endpointType,
            );

            return endpointPlugin ? endpointPlugin.getDefaults(t) : {};
          },
        },
      ]}
    />
  );
};
