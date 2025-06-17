import { evaluationsGetResultsExport } from "@/app/client";
import { downloadFileFromApi, DownloadOptions } from "@/app/utils/download";

export type DownloadEvents = Pick<DownloadOptions, "onStart" | "onFinish">;

export const downloadEvaluationResults = async (
  evaluationId: string,
  events?: DownloadEvents,
) =>
  downloadFileFromApi(
    evaluationsGetResultsExport<true>,
    {
      path: {
        evaluation_id: evaluationId,
      },
    },
    {
      filename: `evaluation-results-${evaluationId}.csv`,
      ...events,
    },
  );
