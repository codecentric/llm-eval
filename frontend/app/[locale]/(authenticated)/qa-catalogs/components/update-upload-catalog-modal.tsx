"use client";

import { addToast, Input, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdFileUpload } from "react-icons/md";
import * as z from "zod";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { QA_CATALOG_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/queries";
import { QA_CATALOGS_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { ErrorDisplay } from "@/app/[locale]/components/error-display";
import { FormInput } from "@/app/[locale]/components/form-input";
import { useFormFieldErrorMessageBuilder } from "@/app/[locale]/hooks/use-form-field-error-message-builder";
import { qaCatalogUpdate, qaCatalogUpload } from "@/app/client";
import {
  AppModal,
  AppModalBody,
  AppModalCancelButton,
  AppModalFooter,
  AppModalHeader,
  AppModalPrimaryButton,
} from "@/app/components/modal";
import { callApi } from "@/app/utils/backend-client/client";
import { formErrors } from "@/app/utils/form-errors";
import { useRouter } from "@/i18n/routing";

const SUPPORTED_FORMATS = [".csv", ".json", ".xlsx"];

export type UpdateUploadCatalogModalProps = {
  catalogId?: string;
} & React.ComponentProps<"div">;

const fileSchema = z
  .unknown()
  .transform((value) => {
    return value as FileList | null | undefined;
  })
  .transform((value) => value?.item(0))
  .refine((file) => !!file, { message: formErrors.required })
  .refine(
    (file) => {
      if (!file) {
        return true;
      }
      const fileExtension = "." + file.name.split(".").pop();

      return !!fileExtension && SUPPORTED_FORMATS.includes(fileExtension);
    },
    { message: "UpdateUploadCatalogModal.unsupportedType" },
  );

const uploadSchema = z.object({
  mode: z.literal("upload"),
  file: fileSchema,
  name: z
    .string({ required_error: formErrors.required })
    .min(1, { message: formErrors.required }),
});

const updateSchema = z.object({
  mode: z.literal("update"),
  file: fileSchema,
});

const updateUploadFormSchema = z.discriminatedUnion("mode", [
  uploadSchema,
  updateSchema,
]);

type UploadFormData = z.infer<typeof uploadSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

type UpdateUploadFormData = z.infer<typeof updateUploadFormSchema>;

export const UpdateUploadCatalogModal = ({
  catalogId,
  ...props
}: UpdateUploadCatalogModalProps) => {
  const isUpdateCatalog = useMemo(() => !!catalogId, [catalogId]);
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { handleSubmit, register, reset, control, getFieldState } =
    useForm<UpdateUploadFormData>({
      resolver: zodResolver(updateUploadFormSchema),
      defaultValues: {
        mode: catalogId ? "update" : "upload",
      },
    });

  const { isOpen, onOpen, onClose } = useDisclosure({
    onOpen: () => {
      reset();
    },
  });

  const {
    mutate: uploadCatalog,
    error: _uploadCatalogError,
    isPending: uploadCatalogIsPending,
  } = useMutation({
    mutationKey: ["uploadCatalog"],
    mutationFn: ({ file, name }: UploadFormData) =>
      callApi(qaCatalogUpload<true>, {
        body: {
          file,
          name,
        },
      }),
    onSuccess: async ({ id, name }) => {
      addToast({
        title: t("UpdateUploadCatalogModal.catalogCreated", { name }),
        color: "success",
      });
      onClose();
      await queryClient.invalidateQueries({
        queryKey: [QA_CATALOGS_QUERY_BASE_KEY],
      });

      router.push(qaCatalogDetailPage(id).href);
    },
  });

  const {
    mutate: updateCatalog,
    error: _updateCatalogError,
    isPending: updateCatalogIsPending,
  } = useMutation({
    mutationKey: ["updateCatalog"],
    mutationFn: ({ file }: UpdateFormData) =>
      callApi(qaCatalogUpdate<true>, {
        body: {
          file,
        },
        path: {
          catalog_id: catalogId as string,
        },
      }),
    onSuccess: async ({ id, name }) => {
      addToast({
        title: t("UpdateUploadCatalogModal.catalogUpdated", { name }),
        color: "success",
      });
      onClose();
      await queryClient.invalidateQueries({
        queryKey: [QA_CATALOGS_QUERY_BASE_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [QA_CATALOG_QUERY_BASE_KEY, id],
      });
      router.push(qaCatalogDetailPage(id).href);
    },
  });

  const uploadInProgress = useMemo(
    () => uploadCatalogIsPending || updateCatalogIsPending,
    [updateCatalogIsPending, uploadCatalogIsPending],
  );

  const errorMessageBuilder = useFormFieldErrorMessageBuilder();
  const fileFieldState = getFieldState("file");

  const error = catalogId ? _updateCatalogError : _uploadCatalogError;

  const onSubmit: SubmitHandler<UpdateUploadFormData> = useCallback(
    (data) => {
      if (data.mode === "update") {
        updateCatalog(data);
      } else {
        uploadCatalog(data);
      }
    },
    [updateCatalog, uploadCatalog],
  );

  return (
    <div
      {...props}
      aria-label={t(
        isUpdateCatalog
          ? "UpdateUploadCatalogModal.pageActionButton.update"
          : "UpdateUploadCatalogModal.pageActionButton.upload",
      )}
    >
      <AppModal
        size="xl"
        isOpen={isOpen}
        onClose={onClose}
        trigger={
          <PageAction
            icon={MdFileUpload}
            onPress={onOpen}
            text={t(
              isUpdateCatalog
                ? "UpdateUploadCatalogModal.pageActionButton.update"
                : "UpdateUploadCatalogModal.pageActionButton.upload",
            )}
            inlineText={!catalogId}
          />
        }
      >
        {(onClose) => (
          <>
            <AppModalHeader
              tabIndex={0}
              aria-label={t("UpdateUploadCatalogModal.header")}
            >
              {t("UpdateUploadCatalogModal.header")}
            </AppModalHeader>
            <AppModalBody>
              <p tabIndex={0}>
                {t("UpdateUploadCatalogModal.supportedFormats")}
                <span className="ml-2 text-slate-400 italic">
                  {SUPPORTED_FORMATS.join(",")}
                </span>
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                id="upload-form"
                className="space-y-3"
                noValidate
              >
                <Input
                  isRequired
                  type="file"
                  aria-label={t("UpdateUploadCatalogModal.chooseFile")}
                  label={t("UpdateUploadCatalogModal.chooseFile")}
                  accept={SUPPORTED_FORMATS.join(",")}
                  variant="bordered"
                  classNames={{
                    inputWrapper: "rounded-small",
                  }}
                  {...register("file")}
                  isInvalid={fileFieldState.invalid}
                  errorMessage={errorMessageBuilder(fileFieldState.error)}
                />
                {!isUpdateCatalog && (
                  <FormInput
                    control={control}
                    isRequired
                    name="name"
                    variant="bordered"
                    label={t("UpdateUploadCatalogModal.catalogName")}
                  />
                )}
              </form>

              {error && (
                <ErrorDisplay
                  message={t("UpdateUploadCatalogModal.catalogUploadError")}
                  error={error}
                  classNames={{ codeBlock: "max-h-96" }}
                />
              )}
            </AppModalBody>
            <AppModalFooter>
              <AppModalCancelButton
                onPress={onClose}
                isDisabled={uploadInProgress}
              >
                {t("UpdateUploadCatalogModal.cancelButton")}
              </AppModalCancelButton>
              <AppModalPrimaryButton
                type="submit"
                form="upload-form"
                isLoading={uploadInProgress}
              >
                {t("UpdateUploadCatalogModal.uploadButton")}
              </AppModalPrimaryButton>
            </AppModalFooter>
          </>
        )}
      </AppModal>
    </div>
  );
};
