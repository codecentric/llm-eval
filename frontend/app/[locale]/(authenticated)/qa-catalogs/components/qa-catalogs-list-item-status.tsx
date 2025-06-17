import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  QA_CATALOGS_LIMIT,
  QA_CATALOGS_QUERY_BASE_KEY,
} from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { qaCatalogGetPreview, QaCatalogPreview } from "@/app/client";
import { TableRow } from "@/app/hooks/use-table";
import { callApi } from "@/app/utils/backend-client/client";
import { updatePageItem } from "@/app/utils/react-query";

import { QACatalogStatusChip } from "./qa-catalog-status-chip";

const pageItemMapper =
  (newItem: QaCatalogPreview) =>
  (oldItem: QaCatalogPreview): QaCatalogPreview =>
    oldItem.id === newItem.id ? newItem : oldItem;

export type QACatalogsListItemStatus = {
  row: TableRow<QaCatalogPreview>;
};

export const QACatalogsListItemStatus = ({ row }: QACatalogsListItemStatus) => {
  const queryClient = useQueryClient();
  const { mutate: updateCatalog } = useMutation({
    mutationKey: ["updateQACatalogPreview"],
    mutationFn: () =>
      callApi(qaCatalogGetPreview<true>, {
        path: { catalog_id: row.id },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<InfiniteData<QaCatalogPreview[]>>(
        [
          QA_CATALOGS_QUERY_BASE_KEY,
          {
            limit: QA_CATALOGS_LIMIT,
          },
        ],
        (old) => updatePageItem(old, data, pageItemMapper),
      );
    },
  });

  return <QACatalogStatusChip status={row.status} onUpdate={updateCatalog} />;
};
