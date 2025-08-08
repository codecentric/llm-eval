import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { z } from "zod";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import {
  EVALUATION_QUERY_BASE_KEY,
  EVALUATION_SUMMARY_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/eval/[evaluationId]/queries";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { EVALUATIONS_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/eval/queries";
import { FormInput } from "@/app/[locale]/components/form-input";
import { FormWizard, SubmitData } from "@/app/[locale]/components/form-wizard";
import {
  evaluationsPatch,
  EvaluationUpdate,
  LlmEvalEvalEvaluationsModelsEvaluationResult,
} from "@/app/client";
import { EditOrigin } from "@/app/types/edit-origin";
import { callApi } from "@/app/utils/backend-client/client";
import { formErrors } from "@/app/utils/form-errors";
import { useRouter } from "@/i18n/routing";

const editSchema = z.object({
  name: z
    .string({ required_error: formErrors.required })
    .nonempty(formErrors.required),
});

const schemas = { default: editSchema };

export type EvaluationEditFormWizardProps = {
  evaluation: LlmEvalEvalEvaluationsModelsEvaluationResult;
  origin?: EditOrigin;
};

export const EvaluationEditFormWizard: React.FC<
  EvaluationEditFormWizardProps
> = ({ evaluation, origin }) => {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: update, isPending: updating } = useMutation({
    mutationKey: ["updateEvaluation"],
    mutationFn: ({
      evaluationId,
      updateData,
    }: {
      evaluationId: string;
      updateData: EvaluationUpdate;
    }) =>
      callApi(evaluationsPatch<true>, {
        path: {
          evaluation_id: evaluationId,
        },
        body: updateData,
      }),
    onSuccess: async ({ id, name }) => {
      addToast({
        title: t("EvaluationEditFormWizard.update.success", { name }),
        color: "success",
      });

      await queryClient.invalidateQueries({
        queryKey: [EVALUATIONS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [EVALUATION_QUERY_BASE_KEY, id],
      });
      await queryClient.invalidateQueries({
        queryKey: [EVALUATION_SUMMARY_QUERY_BASE_KEY, id],
      });

      router.push(evaluationPage({ evaluationId: id }).href);
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
      const updateData: EvaluationUpdate = {
        name: data.default.name,
        version: evaluation.version,
      };

      update({ evaluationId: evaluation.id, updateData });
    },
    [evaluation, update],
  );

  const onCancel = useCallback(() => {
    if (evaluation && origin === EditOrigin.DETAILS) {
      router.push(evaluationPage({ evaluationId: evaluation.id }).href);
    } else {
      router.push(evaluationsPage.href);
    }
  }, [router, evaluation, origin]);

  return (
    <FormWizard
      schemas={schemas}
      submitLabel={t("EvaluationEditFormWizard.submitLabel")}
      globalSubmit={true}
      initialState={{ default: { name: evaluation.name } }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={updating}
      pages={[
        {
          key: "default",
          name: "default",
          defaultValues: () => ({ name: undefined }),
          render: ({ control }) => (
            <FormInput
              variant="bordered"
              isRequired
              control={control}
              name="name"
              label={t("EvaluationEditFormWizard.field.name.label")}
              className="col-span-2"
            />
          ),
        },
      ]}
    />
  );
};
