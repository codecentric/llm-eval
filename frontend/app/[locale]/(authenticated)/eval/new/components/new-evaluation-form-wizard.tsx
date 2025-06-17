import { addToast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import {
  NewEvaluationForm,
  newEvaluationSchema,
} from "@/app/[locale]/(authenticated)/eval/new/components/new-evaluation-form";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import { FormWizard, SubmitData } from "@/app/[locale]/components/form-wizard";
import {
  evaluationsPost,
  Metric,
  RunEvaluationByQaCatalog,
} from "@/app/client";
import { callApi } from "@/app/utils/backend-client/client";
import { useRouter } from "@/i18n/routing";

const schemas = {
  main: newEvaluationSchema,
};

export type NewEvaluationFormWizardProps = {
  catalogId?: string;
  origin: StartEvalOrigin;
  availableMetrics: Metric[];
};

export const NewEvaluationFormWizard: React.FC<
  NewEvaluationFormWizardProps
> = ({ catalogId, origin, availableMetrics }) => {
  const t = useTranslations();
  const router = useRouter();

  const { mutate: startEvaluation, isPending } = useMutation({
    mutationKey: ["startEvaluation"],
    mutationFn: (data: RunEvaluationByQaCatalog) =>
      callApi(evaluationsPost<true>, { body: data }),
    onSuccess: (data) => {
      addToast({
        title: t("NewEvaluationFormWizard.successMessage"),
        color: "success",
      });
      router.replace(evaluationPage({ evaluationId: data.id }).href);
    },
  });

  const onSubmit = useCallback(
    (data: SubmitData<typeof schemas>) => {
      startEvaluation({
        name: data.main.executionName,
        testCasesPerQaPair: data.main.numberOfTestCases,
        catalogId: data.main.catalogId,
        llmEndpointId: data.main.endpointId,
        metrics: data.main.metrics,
      });
    },
    [startEvaluation],
  );

  const onCancel = useCallback(() => {
    if (origin === StartEvalOrigin.CATALOG && catalogId) {
      router.push(qaCatalogDetailPage(catalogId).href);
    } else if (origin === StartEvalOrigin.CATALOGS) {
      router.push(qaCatalogsPage.href);
    } else {
      router.push(evaluationsPage.href);
    }
  }, [origin, catalogId, router]);

  return (
    <FormWizard
      schemas={schemas}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={t("NewEvaluationFormWizard.submitLabel")}
      loading={isPending}
      pages={[
        {
          key: "main",
          name: "",
          render: ({ control }) => (
            <NewEvaluationForm
              control={control}
              catalogLocked={!!catalogId}
              availableMetrics={availableMetrics}
            />
          ),
          defaultValues: () => ({
            catalogId: catalogId ?? null,
            endpointId: null,
            executionName: "",
            numberOfTestCases: 5,
            metrics: [],
          }),
        },
      ]}
    />
  );
};
