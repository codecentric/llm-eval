"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { QACatalogGeneratorFormWizard } from "@/app/[locale]/(authenticated)/qa-catalogs/generate/components/qa-catalog-generation-form-wizard";
import { generateQACatalogPage } from "@/app/[locale]/(authenticated)/qa-catalogs/generate/page-info";
import { activeQaCatalogTypesQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export const GenerateCatalogPage: React.FC = () => {
  const {
    data: catalogGeneratorTypesData,
    error: qaCatalogGeneratorTypesError,
  } = useQuery(clientQueryOptions(activeQaCatalogTypesQueryDefinition));

  return (
    <PageContent pageInfo={generateQACatalogPage}>
      <DisplayContentOrError error={qaCatalogGeneratorTypesError}>
        {catalogGeneratorTypesData && (
          <QACatalogGeneratorFormWizard
            generatorTypes={catalogGeneratorTypesData}
          />
        )}
      </DisplayContentOrError>
    </PageContent>
  );
};
