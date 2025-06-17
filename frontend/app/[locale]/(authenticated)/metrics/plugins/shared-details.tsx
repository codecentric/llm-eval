import { Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { llmEndpointQueryDefinition } from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { DisplayContentOrError } from "@/app/[locale]/components/display-content-or-error";
import { createListValueItem } from "@/app/[locale]/components/property-list";
import { NavigationLink } from "@/app/components/navigation-link";
import { clientQueryOptions } from "@/app/utils/react-query/client";

export const endpointValueItem = (
  endpointId: string,
  t: ReturnType<typeof useTranslations>,
) => {
  return createListValueItem({
    label: t("MetricDetails.labels.chatModel"),
    value: endpointId,
    fullWidth: true,
    renderValue: (endpointId) => (
      <MetricDetailsLlmEndpointValue endpointId={endpointId} />
    ),
  });
};

const MetricDetailsLlmEndpointValue = ({
  endpointId,
}: {
  endpointId: string;
}) => {
  const t = useTranslations();
  const { data, error, isFetching } = useQuery(
    clientQueryOptions(llmEndpointQueryDefinition(endpointId)),
  );

  return (
    <DisplayContentOrError
      error={error}
      errorMessage={t("MetricDetailsLlmEndpointValue.loadError", {
        id: endpointId,
      })}
    >
      <div className="flex flex-row items-center gap-x-2">
        <NavigationLink href={llmEndpointDetailsPage(endpointId).href}>
          {isFetching ? (
            <Skeleton className="h-4 w-64 rounded-md" />
          ) : (
            (data?.name ?? endpointId)
          )}
        </NavigationLink>
      </div>
    </DisplayContentOrError>
  );
};
