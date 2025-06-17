import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { EvaluationStatusChip } from "@/app/[locale]/(authenticated)/eval/components/evaluation-status-chip";
import { EVALUATIONS_QUERY_BASE_KEY } from "@/app/[locale]/(authenticated)/eval/queries";
import {
  EvaluationDetailSummary,
  EvaluationsGetAllResponse,
  evaluationsGetEvaluationDetailSummary,
  GetAllEvaluationResult,
} from "@/app/client";
import { TableRow } from "@/app/hooks/use-table";
import { callApi } from "@/app/utils/backend-client/client";
import { updatePageItem } from "@/app/utils/react-query";

const pageItemMapper =
  (newItem: EvaluationDetailSummary) =>
  (oldItem: GetAllEvaluationResult): GetAllEvaluationResult =>
    oldItem.id === newItem.id
      ? {
          ...oldItem,
          metricResults: newItem.metricResults,
          status: newItem.status,
          testCaseProgress: newItem.testCaseProgress,
        }
      : oldItem;

export type EvaluationListItemStatusProps = {
  row: TableRow<GetAllEvaluationResult>;
};

export const EvaluationListItemStatus = ({
  row,
}: EvaluationListItemStatusProps) => {
  const queryClient = useQueryClient();
  const { mutate: updateEvaluation } = useMutation({
    mutationKey: ["updateEvaluation"],
    mutationFn: () =>
      callApi(evaluationsGetEvaluationDetailSummary<true>, {
        path: {
          evaluation_id: row.id,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<InfiniteData<EvaluationsGetAllResponse>>(
        [EVALUATIONS_QUERY_BASE_KEY],
        (old) => updatePageItem(old, data, pageItemMapper),
      );
    },
  });

  return (
    <EvaluationStatusChip
      status={row.status}
      progress={row.testCaseProgress}
      onUpdate={updateEvaluation}
    />
  );
};
