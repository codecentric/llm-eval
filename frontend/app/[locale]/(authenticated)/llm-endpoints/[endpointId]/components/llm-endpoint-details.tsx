import { useTranslations } from "next-intl";

import { LlmEndpointFeatures } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-features";
import { useEndpointPlugin } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins";
import {
  createListValueItem,
  PropertyList,
  PropertyListItem,
  Separator,
} from "@/app/[locale]/components/property-list";
import { LlmEndpoint } from "@/app/client";

export type LlmEndpointDetailsProps = { endpoint: LlmEndpoint };

export const LlmEndpointDetails = ({ endpoint }: LlmEndpointDetailsProps) => {
  const t = useTranslations();
  const endpointPlugin = useEndpointPlugin(endpoint.configuration.type);

  const propertyListItems: PropertyListItem[] = [
    createListValueItem({
      label: t("LlmEndpointDetails.labels.type"),
      value: t(`llmEndpointType.${endpoint.configuration.type}`),
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.features"),
      value: endpoint.supportedFeatures,
      renderValue: (value) => <LlmEndpointFeatures supportedFeatures={value} />,
    }),
    Separator,
    createListValueItem({
      label: t("LlmEndpointDetails.labels.createdAt"),
      value: endpoint.createdAt,
    }),
    createListValueItem({
      label: t("LlmEndpointDetails.labels.updatedAt"),
      value: endpoint.updatedAt,
    }),
    Separator,
    ...(endpointPlugin?.getDetailItems(endpoint, t) ?? []),
  ];

  return <PropertyList items={propertyListItems} />;
};
