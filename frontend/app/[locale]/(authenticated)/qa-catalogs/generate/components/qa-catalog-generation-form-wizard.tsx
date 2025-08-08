"use client";

import { addToast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Control } from "react-hook-form";
import { z } from "zod";

import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import { catalogGeneratorConfigurationSchema } from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/helpers";
import { BaseQACatalogGenerationType } from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/plugin-definition";
import { getCatalogGeneratorPlugin } from "@/app/[locale]/(authenticated)/qa-catalogs/plugins/use-catalog-generator-plugin";
import { FormWizard, SubmitData } from "@/app/[locale]/components/form-wizard";
import {
  ActiveQaCatalogGeneratorType,
  qaCatalogCreateDataSourceConfig,
  qaCatalogGenerate,
  QaCatalogGenerationConfig,
  QaCatalogGenerationData,
} from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";
import { useRouter } from "@/i18n/routing";

import { QACatalogGeneratorConfigurationForm } from "./qa-catalog-configuration-form";
import {
  catalogGeneratorTypeSelectionSchema,
  QACatalogGeneratorTypeSelectionForm,
} from "./qa-catalog-generation-type-selection-form";

const schemas = {
  generatorType: catalogGeneratorTypeSelectionSchema,
  configuration: catalogGeneratorConfigurationSchema,
};

export type QACatalogGeneratorFormWizardProps = {
  generatorTypes: ActiveQaCatalogGeneratorType[];
};

export const QACatalogGeneratorFormWizard = ({
  generatorTypes,
}: QACatalogGeneratorFormWizardProps) => {
  const t = useTranslations();
  const router = useRouter();

  const { mutateAsync: upload, isPending: uploading } = useMutation({
    mutationKey: ["uploadFilesForCatalogGeneration"],
    mutationFn: async ({
      files,
      generatorType,
    }: {
      files: FileList;
      generatorType: BaseQACatalogGenerationType;
    }) => {
      const _files: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file != null) {
          _files.push(file);
        }
      }

      return callApi(qaCatalogCreateDataSourceConfig<true>, {
        body: {
          files: _files,
          generator_type: generatorType,
        },
      });
    },
    onSuccess: async () => {
      addToast({
        title: t("uploadFilesForCatalogGeneration.success"),
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: t("uploadFilesForCatalogGeneration.errorUploading"),
        color: "danger",
      });
      console.error(error);
    },
  });

  const { mutateAsync: start, isPending: starting } = useMutation({
    mutationKey: ["startQACatalogGeneration"],
    mutationFn: async (data: QaCatalogGenerationData) =>
      callApi(qaCatalogGenerate<true>, { body: data }),
    onSuccess: async () => {
      addToast({
        title: t("startQACatalogGeneration.success"),
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: t("startQACatalogGeneration.errorStarting"),
        color: "danger",
      });
      console.error(error);
    },
  });

  const onSubmit = useCallback(
    async (data: SubmitData<typeof schemas>) => {
      const dataSourceConfigId = await upload({
        files: data.configuration.files as FileList,
        generatorType: data.configuration.type,
      });

      const config: QaCatalogGenerationConfig = {
        ...data.configuration.config,
        type: data.configuration.type,
        knowledgeGraphLocation: null,
      };

      const generationData: QaCatalogGenerationData = {
        type: data.configuration.type,
        name: data.configuration.name,
        config: config,
        modelConfigSchema: {
          ...data.configuration.modelConfig,
          type: data.configuration.type,
        },
        dataSourceConfigId: dataSourceConfigId,
      };

      const startResult = await start(generationData);

      router.push(qaCatalogDetailPage(startResult.catalogId).href);
    },
    [upload, start, router],
  );

  const onCancel = useCallback(() => {
    router.push(qaCatalogsPage.href);
  }, [router]);

  return (
    <FormWizard
      schemas={schemas}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={t(`QACatalogGeneratorForm.generate`)}
      loading={uploading || starting}
      pages={[
        {
          key: "generatorType",
          name: t("QACatalogGeneratorForm.tab.type"),
          render: ({ control, loading }) => (
            <QACatalogGeneratorTypeSelectionForm
              control={control}
              generatorTypes={generatorTypes}
              isDisabled={loading}
            />
          ),
          defaultValues: () => ({
            generatorType: undefined,
          }),
          onStateChange: ({ state, clearPageState }) => {
            if (
              state.configuration?.type &&
              state.configuration.type !== state.generatorType?.generatorType
            ) {
              clearPageState("configuration");
            }
          },
        },
        {
          key: "configuration",
          name: t("QACatalogGeneratorForm.tab.configuration"),
          render: ({ control, state, loading }) => (
            <QACatalogGeneratorConfigurationForm
              generatorType={state.generatorType?.generatorType}
              control={
                control as Control<
                  z.infer<typeof catalogGeneratorConfigurationSchema>
                >
              }
              isDisabled={loading}
            />
          ),
          defaultValues: (state) => {
            const generatorPlugin = getCatalogGeneratorPlugin(
              state.generatorType?.generatorType,
            );

            return generatorPlugin ? generatorPlugin.getDefaults(t) : {};
          },
        },
      ]}
    />
  );
};
