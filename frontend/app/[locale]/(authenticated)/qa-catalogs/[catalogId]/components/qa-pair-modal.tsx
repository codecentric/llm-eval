import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormStringArray } from "@/app/[locale]/components/form-string-array";
import { FormTextarea } from "@/app/[locale]/components/form-textarea";
import { NewQaPair, QaPair } from "@/app/client";
import {
  AppModal,
  AppModalBody,
  AppModalCancelButton,
  AppModalFooter,
  AppModalHeader,
  AppModalPrimaryButton,
} from "@/app/components/modal";
import { formErrors } from "@/app/utils/form-errors";

const qaPairSchema = z.object({
  question: z.string().min(1, formErrors.required),
  expectedOutput: z.string().min(1, formErrors.required),
  contexts: z.array(z.string().min(1, formErrors.required)).optional(),
});

export type QaPairFormData = z.infer<typeof qaPairSchema>;

type QAPairModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (qaPair: NewQaPair) => void;
  initialData?: Partial<QaPair>;
  mode: "add" | "edit" | "view";
};

export const QAPairModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: QAPairModalProps) => {
  const t = useTranslations();

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm<QaPairFormData>({
    resolver: zodResolver(qaPairSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      question: initialData?.question ?? "",
      expectedOutput: initialData?.expectedOutput ?? "",
      contexts: initialData?.contexts?.length ? initialData.contexts : [],
    },
  });

  const onFormSubmit = (data: QaPairFormData) => {
    if (hasDataChanged(initialData, data)) {
      onSubmit(data as NewQaPair);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      reset({
        question: initialData?.question ?? "",
        expectedOutput: initialData?.expectedOutput ?? "",
        contexts: initialData?.contexts || [],
      });
    }
  }, [isOpen, reset, initialData]);

  const hasDataChanged = useCallback(
    (
      original: Partial<QaPair> | undefined,
      modified: QaPairFormData,
    ): boolean => {
      if (!original || mode === "add") return true;
      return (
        original.question !== modified.question ||
        original.expectedOutput !== modified.expectedOutput ||
        JSON.stringify(original.contexts ?? []) !==
          JSON.stringify(modified.contexts)
      );
    },
    [mode],
  );

  const isViewMode = mode === "view";

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <AppModalHeader>{t(`QaPairsTable.${mode}Pair`)}</AppModalHeader>
      <AppModalBody>
        <form
          id="qa-pair-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-4"
        >
          <FormTextarea
            name="question"
            variant="bordered"
            isRequired={!isViewMode}
            isReadOnly={isViewMode}
            control={control}
            label={t("QaPairsTable.question")}
          />

          <FormTextarea
            name="expectedOutput"
            variant="bordered"
            isRequired={!isViewMode}
            isReadOnly={isViewMode}
            control={control}
            label={t("QaPairsTable.expectedOutput")}
          />

          <FormStringArray
            control={control}
            name="contexts"
            className="col-span-2"
            label={t("QaPairsTable.contexts")}
            addButtonTooltip={t("QaPairsTable.addContext")}
            removeButtonTooltip={t("QaPairsTable.removeContext")}
            isReadOnly={isViewMode}
          />
        </form>
      </AppModalBody>
      <AppModalFooter>
        <AppModalCancelButton onPress={onClose}>
          {t("QaPairsTable.cancel")}
        </AppModalCancelButton>
        {!isViewMode && (
          <AppModalPrimaryButton
            form="qa-pair-form"
            type="submit"
            isDisabled={isSubmitting}
          >
            {mode === "add" ? t("QaPairsTable.add") : t("QaPairsTable.save")}
          </AppModalPrimaryButton>
        )}
      </AppModalFooter>
    </AppModal>
  );
};
