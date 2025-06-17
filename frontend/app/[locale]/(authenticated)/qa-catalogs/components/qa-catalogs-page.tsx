"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { QACatalogPreviewTable } from "@/app/[locale]/(authenticated)/qa-catalogs/components/qa-catalog-preview-table";
import { UpdateUploadCatalogModal } from "@/app/[locale]/(authenticated)/qa-catalogs/components/update-upload-catalog-modal";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import { qaCatalogsQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientInfiniteQueryOptions } from "@/app/utils/react-query/client";

import { NavigateToGenerationPageAction } from "./navigate-to-generation-page-action";

export type QACatalogsPageProps = {
  contextHelp: React.ReactElement;
};

export const QACatalogsPage: React.FC<QACatalogsPageProps> = ({
  contextHelp,
}) => {
  const t = useTranslations("QACatalogsPage");

  const {
    data: qaCatalogs,
    error: qaCatalogsError,
    hasNextPage: hasMoreQACatalogs,
    fetchNextPage: loadMoreQACatalogs,
  } = useInfiniteQuery(clientInfiniteQueryOptions(qaCatalogsQueryDefinition()));

  const loadMore = useCallback(async () => {
    await loadMoreQACatalogs();
  }, [loadMoreQACatalogs]);

  return (
    <PageContent
      pageInfo={qaCatalogsPage}
      actions={[
        <NavigateToGenerationPageAction key="generate" />,
        <UpdateUploadCatalogModal key="upload" />,
      ]}
      helpPage={contextHelp}
    >
      <DisplayContentOrError
        error={qaCatalogsError}
        errorMessage={t("qaCatalogsLoadingError")}
      >
        {qaCatalogs && (
          <QACatalogPreviewTable
            items={qaCatalogs}
            className="max-h-full"
            hasMore={hasMoreQACatalogs}
            loadMore={loadMore}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
