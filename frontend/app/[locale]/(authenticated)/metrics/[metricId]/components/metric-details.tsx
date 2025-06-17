import { useTranslations } from "next-intl";

import { useMetricPlugin } from "@/app/[locale]/(authenticated)/metrics/plugins";
import {
  createListValueItem,
  PropertyList,
  PropertyListItem,
  Separator,
} from "@/app/[locale]/components/property-list";
import { Metric } from "@/app/client";

export type MetricDetailsProps = {
  metric: Metric;
};

export const MetricDetails = ({ metric }: MetricDetailsProps) => {
  const t = useTranslations();
  const metricPlugin = useMetricPlugin(metric.configuration.type);

  const propertyListItems: PropertyListItem[] = [
    createListValueItem({
      label: t("MetricDetails.labels.type"),
      value: t(`metricType.${metric.configuration.type}`),
      fullWidth: true,
    }),
    Separator,
    createListValueItem({
      label: t("MetricDetails.labels.createdAt"),
      value: metric.createdAt,
    }),
    createListValueItem({
      label: t("MetricDetails.labels.updatedAt"),
      value: metric.updatedAt,
    }),
    Separator,
    ...(metricPlugin?.getDetailItems(metric, t) ?? []),
  ];

  return <PropertyList items={propertyListItems} />;
};
