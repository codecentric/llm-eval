import { cx } from "classix";
import React from "react";

import { MetricResult } from "@/app/client";

export type MetricResultValueDisplayProps = {
  className?: string;
  metricResult: MetricResult;
};

export const MetricResultValueDisplay: React.FC<
  MetricResultValueDisplayProps
> = ({ className, metricResult }) => {
  return (
    <div className={cx("flex gap-1", className)}>
      <div className="text-success">{metricResult.successes}</div>
      <div>-</div>
      <div className="text-danger">{metricResult.failures}</div>
      <div>-</div>
      <div className="text-warning">{metricResult.errors}</div>
    </div>
  );
};
