import { cx } from "classix";
import React, { useMemo } from "react";

import { MetricResult as ApiMetricResult } from "@/app/client";

import { MetricResultValueDisplay } from "./metric-result-value-display";

export type MetricResultsBoxProps = {
  className?: string;
  metricResults: ApiMetricResult[];
};

export const MetricResultsBox: React.FC<MetricResultsBoxProps> = ({
  metricResults,
  className,
}) => {
  const sortedMetricResults = useMemo(
    () => [...metricResults].sort((a, b) => a.name.localeCompare(b.name)),
    [metricResults],
  );

  return metricResults.length ? (
    <div
      className={cx(
        "grid grid-cols-[minmax(auto,_1fr)_auto]",
        "border-2 border-default-100 rounded-small overflow-hidden",
        "*:border-default-100",
        className,
      )}
    >
      {sortedMetricResults.map((metricResult) => (
        <React.Fragment key={metricResult.id}>
          <div className="bg-default-100/30 px-1 border-r-1 [&:not(:nth-last-child(-n+2))]:border-b-2">
            {metricResult.name}
          </div>
          <div className="flex justify-end [&:not(:nth-last-child(-n+2))]:border-b-2">
            <MetricResultValueDisplay
              metricResult={metricResult}
              className="px-1"
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  ) : null;
};
