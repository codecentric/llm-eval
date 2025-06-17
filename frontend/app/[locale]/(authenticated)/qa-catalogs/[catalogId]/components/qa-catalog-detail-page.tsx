"use client";

import {
  addToast,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { MdAdd, MdClose, MdDelete, MdDone, MdHistory } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { NewEvaluationPageAction } from "@/app/[locale]/(authenticated)/eval/new/components/new-evaluation-page-action";
import { QAPairModal } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/components/qa-pair-modal";
import {
  QaPairsTable,
  QaPairTableRow,
} from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/components/qa-pairs-table";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import {
  qaCatalogQaPairsQueryDefinition,
  qaCatalogQueryDefinition,
} from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/queries";
import { DownloadQACatalogModal } from "@/app/[locale]/(authenticated)/qa-catalogs/components/download-qa-catalog-modal";
import { QACatalogStatusChip } from "@/app/[locale]/(authenticated)/qa-catalogs/components/qa-catalog-status-chip";
import { UpdateUploadCatalogModal } from "@/app/[locale]/(authenticated)/qa-catalogs/components/update-upload-catalog-modal";
import { useQaCatalogDelete } from "@/app/[locale]/(authenticated)/qa-catalogs/hooks/use-qa-catalog-delete";
import { useQaPairs } from "@/app/[locale]/(authenticated)/qa-catalogs/hooks/use-qa-pairs";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import { qaCatalogHistoryHistoryQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { useModalState } from "@/app/[locale]/hooks/use-modal-state";
import { NewQaPair, QaCatalogStatus, QaPair } from "@/app/client";
import {
  clientInfiniteQueryOptions,
  clientQueryOptions,
} from "@/app/utils/react-query/client";
import { useRouter } from "@/i18n/routing";

export type QaCatalogPageProps = {
  catalogId: string;
};

const VersionSelectPageAction = ({ catalogId }: { catalogId: string }) => {
  const t = useTranslations("QACatalogPage");
  const formatter = useFormatter();

  const { data: catalogHistory, isPending } = useQuery({
    ...clientQueryOptions(qaCatalogHistoryHistoryQueryDefinition(catalogId)),
  });

  return (
    <Dropdown
      backdrop="opaque"
      placement="bottom-end"
      showArrow
      classNames={{
        base: ["before:bg-primary"],
        content: ["border-2", "border-primary"],
      }}
    >
      <DropdownTrigger>
        <PageAction
          icon={MdHistory}
          text={t("versionHistory")}
          isDisabled={!catalogHistory || catalogHistory?.versions.length == 0}
          isLoading={isPending}
          data-testid="history-dropdown-btn"
        />
      </DropdownTrigger>
      {catalogHistory && (
        <DropdownMenu
          aria-label={t("versionHistoryLabel")}
          selectionMode="single"
          selectedKeys={[catalogId]}
        >
          {catalogHistory?.versions.map((version) => (
            <DropdownItem
              key={version.versionId}
              href={qaCatalogDetailPage(version.versionId).href}
            >
              {`${version.revision} - ${formatter.dateTime(new Date(version.createdAt))}`}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

export const QACatalogDetailPage = ({ catalogId }: QaCatalogPageProps) => {
  const t = useTranslations();
  const router = useRouter();

  // State
  const {
    pendingChanges,
    hasPendingChanges,
    pendingChangesCount,
    handleEdit,
    handleAdd,
    handleDelete,
    handleUndo,
    handleSaveAll,
    handleCancelAll,
  } = useQaPairs(catalogId);

  const {
    isOpen: isQAPairModalOpen,
    onOpen: openQAPairModal,
    onClose: closeQAPairModal,
  } = useModalState();

  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingData, setEditingData] = useState<Partial<QaPair> | undefined>();

  const {
    data: qaCatalogDetails,
    error: qaCatalogDetailsError,
    refetch: refetchQACatalogDetails,
  } = useQuery(clientQueryOptions(qaCatalogQueryDefinition(catalogId)));

  const {
    data: qaPairs,
    error: qaPairsError,
    hasNextPage: hasMoreQAPairs,
    fetchNextPage: loadMoreQAPairs,
    refetch: refetchQAPairs,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(qaCatalogQaPairsQueryDefinition(catalogId)),
  );

  const loadMore = useCallback(async () => {
    await loadMoreQAPairs();
  }, [loadMoreQAPairs]);

  const onStatusPoll = useCallback(
    () => Promise.all([refetchQACatalogDetails(), refetchQAPairs()]),
    [refetchQACatalogDetails, refetchQAPairs],
  );

  const { delete: deleteQaCatalog } = useQaCatalogDelete({
    onSuccess: ({ message }) => {
      router.replace(qaCatalogsPage.href);
      addToast({
        title: message,
        color: "success",
      });
    },
  });

  // Add QA pair modal handlers
  const handleAddQAPairClick = useCallback(() => {
    setModalMode("add");
    setEditingData(undefined);
    openQAPairModal();
  }, [openQAPairModal]);

  const handleEditQAPair = (row: QaPairTableRow) => {
    setModalMode("edit");
    setEditingData(row);
    openQAPairModal();
  };

  const handleViewQAPair = (row: QaPairTableRow) => {
    setModalMode("view");
    setEditingData(row);
    openQAPairModal();
  };

  const handleQAPairSubmit = (qaPair: NewQaPair) => {
    if (modalMode === "add") {
      handleAdd(qaPair);
    } else if (editingData?.id) {
      // Preserve metadata by merging the updated fields with the original metadata
      const updatedQaPair: QaPair = {
        ...qaPair,
        id: editingData.id,
        metaData: editingData.metaData ?? {}, // Keep the original metadata
      };
      handleEdit(updatedQaPair);
    }
  };

  const catalog = qaCatalogDetails;
  // Page actions
  const pageActions = useMemo(() => {
    if (!catalog) return [];

    return [
      <ButtonGroup key="actions">
        {hasPendingChanges && (
          <>
            <PageAction
              key="saveAll"
              inlineText={true}
              text={`${t("QACatalogPage.saveAll")} (${pendingChangesCount})`}
              onPress={handleSaveAll}
              color="success"
              icon={MdDone}
            />
            <PageAction
              key="cancelAll"
              inlineText={true}
              text={t("QACatalogPage.cancelAll")}
              onPress={handleCancelAll}
              color="danger"
              icon={MdClose}
            />
          </>
        )}
        <PageAction
          key="addQaPair"
          inlineText={true}
          text={t("QaPairsTable.addPair")}
          color="primary"
          onPress={handleAddQAPairClick}
          icon={MdAdd}
        />
      </ButtonGroup>,
      <NewEvaluationPageAction key="startEvaluation" catalogId={catalogId} />,
      <UpdateUploadCatalogModal key="upload" catalogId={qaCatalogDetails.id} />,
      <DownloadQACatalogModal key="download" catalogId={catalogId} />,
      <VersionSelectPageAction key="version-select" catalogId={catalogId} />,
      <PageAction
        key="delete"
        icon={MdDelete}
        color="danger"
        text={t("QACatalogPage.delete")}
        aria-label={t("QACatalogPage.delete")}
        onPress={() => deleteQaCatalog(qaCatalogDetails)}
      />,
    ];
  }, [
    t,
    catalog,
    hasPendingChanges,
    pendingChangesCount,
    handleSaveAll,
    handleCancelAll,
    handleAddQAPairClick,
    catalogId,
    deleteQaCatalog,
    qaCatalogDetails,
  ]);

  return (
    <PageContent
      pageInfo={qaCatalogDetailPage(catalogId, catalog?.name)}
      actions={pageActions}
      titleEnd={
        <QACatalogStatusChip
          status={catalog?.status ?? QaCatalogStatus.FAILURE}
          onUpdate={onStatusPoll}
        />
      }
    >
      <DisplayContentOrError
        error={qaCatalogDetailsError || qaPairsError || catalog?.error}
      >
        {qaPairs && (
          <>
            <QaPairsTable
              items={qaPairs}
              hasMore={hasMoreQAPairs}
              loadMore={loadMore}
              pendingChanges={pendingChanges}
              onEdit={handleEdit}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onUndo={handleUndo}
              onEditRow={handleEditQAPair}
              onViewRow={handleViewQAPair}
            />
            <QAPairModal
              isOpen={isQAPairModalOpen}
              onClose={closeQAPairModal}
              onSubmit={handleQAPairSubmit}
              initialData={editingData}
              mode={modalMode}
            />
          </>
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
