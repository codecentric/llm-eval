import { addToast, SelectItem, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdDownload } from "react-icons/md";
import { z } from "zod";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { qaCatalogHistoryHistoryQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { FormSelect } from "@/app/[locale]/components/form-select";
import { FormSwitch } from "@/app/[locale]/components/form-switch";
import {
  qaCatalogDownload,
  SupportedQaCatalogDownloadFormat,
} from "@/app/client";
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
import { clientQueryOptions } from "@/app/utils/react-query/client";

export type DownloadQACatalogModalProps = { catalogId: string };

const downloadCatalogSchema = z.intersection(
  z.object({
    format: z.enum(
      Object.values(SupportedQaCatalogDownloadFormat) as [
        SupportedQaCatalogDownloadFormat,
        ...SupportedQaCatalogDownloadFormat[],
      ],
      { required_error: formErrors.required },
    ),
  }),
  z.discriminatedUnion("includeAll", [
    z.object({
      versions: z
        .array(z.string(), { required_error: formErrors.required })
        .min(1, { message: formErrors.arrayMin(1) }),
      includeAll: z.literal(false),
    }),
    z.object({
      includeAll: z.literal(true),
    }),
  ]),
);

const supportedDownloadFormats = Object.values(
  SupportedQaCatalogDownloadFormat,
).map((x) => ({
  name: x,
}));

type DownloadFormData = z.infer<typeof downloadCatalogSchema>;

export const DownloadQACatalogModal = ({
  catalogId,
}: DownloadQACatalogModalProps) => {
  const t = useTranslations("DownloadQACatalogModal");
  const formatter = useFormatter();

  const { control, handleSubmit, reset, watch } = useForm<DownloadFormData>({
    resolver: zodResolver(downloadCatalogSchema),
    defaultValues: {
      versions: [],
      includeAll: false,
    },
  });

  const includeAll = watch("includeAll");

  const { data: catalogHistory, refetch: refetchCatalogHistory } = useQuery({
    ...clientQueryOptions(qaCatalogHistoryHistoryQueryDefinition(catalogId)),
    enabled: false,
  });

  const { isOpen, onOpen, onClose } = useDisclosure({
    onOpen: () => {
      reset();
      refetchCatalogHistory();
    },
    onClose: () => {
      reset();
    },
  });

  const { mutateAsync: onSubmit, isPending: downloading } = useMutation({
    mutationKey: ["downloadCatalog"],
    mutationFn: (async (data) => {
      const downloadData = await callApi(qaCatalogDownload<true>, {
        body: {
          format: data.format,
          parentCatalogId: catalogId,
          versionIds: !data.includeAll ? data.versions : null,
          includeAll: data.includeAll,
        },
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadData.downloadUrl;
      downloadLink.download = downloadData.filename;
      downloadLink.click();
      onClose();
    }) satisfies SubmitHandler<DownloadFormData>,
    onSuccess: () => {
      addToast({ title: t("action.success"), color: "success" });
    },
    onError: (e) => {
      console.error(e);
      addToast({ title: t("action.error"), color: "danger" });
    },
  });

  return (
    <AppModal
      isPopover
      isOpen={isOpen}
      onClose={onClose}
      trigger={
        <PageAction
          key="download"
          icon={MdDownload}
          text={t("action.download")}
          aria-label={t("action.download")}
          onPress={onOpen}
        />
      }
      size="md"
    >
      {(onClose) => (
        <>
          <AppModalHeader>{t("modal.header")}</AppModalHeader>
          <AppModalBody>
            <form
              onSubmit={handleSubmit(
                onSubmit as SubmitHandler<DownloadFormData>,
              )}
              id="download-form"
              className="space-y-3"
              noValidate
            >
              <FormSelect
                name="format"
                control={control}
                items={supportedDownloadFormats}
                label={t("form.fields.format.label")}
                placeholder={t("form.fields.format.placeholder")}
                variant="bordered"
                isRequired
              >
                {(format) => (
                  <SelectItem key={format.name}>{format.name}</SelectItem>
                )}
              </FormSelect>
              <FormSelect
                name="versions"
                control={control}
                items={catalogHistory?.versions ?? []}
                label={t("form.fields.versions.label")}
                placeholder={t("form.fields.versions.placeholder")}
                selectionMode="multiple"
                isDisabled={includeAll}
                isRequired={!includeAll}
                variant="bordered"
              >
                {(version) => (
                  <SelectItem key={version.versionId}>
                    {formatter.dateTime(new Date(version.createdAt))}
                  </SelectItem>
                )}
              </FormSelect>

              <FormSwitch name="includeAll" control={control}>
                {t("form.fields.includeAll")}
              </FormSwitch>
            </form>
          </AppModalBody>
          <AppModalFooter>
            <AppModalCancelButton onPress={onClose}>
              {t("modal.buttons.cancel")}
            </AppModalCancelButton>
            <AppModalPrimaryButton
              type="submit"
              form="download-form"
              isLoading={downloading}
            >
              {t("modal.buttons.submit")}
            </AppModalPrimaryButton>
          </AppModalFooter>
        </>
      )}
    </AppModal>
  );
};
