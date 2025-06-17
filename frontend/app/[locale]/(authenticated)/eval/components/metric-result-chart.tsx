import { PieSeriesOption } from "echarts";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";

import { MetricResult } from "@/app/client";
import { ECharts } from "@/app/components/echarts";
import { EChartsLoadingWrapper } from "@/app/components/echatys-loading-wrapper";
import { useEchartsOption } from "@/app/hooks/use-echarts-options";
import { ERROR_FALLBACK_COLOR, hexColor } from "@/app/utils/css-colors";

import type { EChartsOption } from "echarts";

export type MetricResultChartProps = {
  title?: string;
  metricResult: MetricResult;
  className?: string;
};

export const MetricResultChart: React.FC<MetricResultChartProps> = ({
  title,
  metricResult,
  className,
}) => {
  const t = useTranslations();

  const data = useMemo(() => {
    const data: PieSeriesOption["data"] = [];
    if (metricResult.successes > 0) {
      data.push({
        value: metricResult.successes,
        name: t("MetricResultChart.label.success"),
        id: "success",
      });
    }
    if (metricResult.failures > 0) {
      data.push({
        value: metricResult.failures,
        name: t("MetricResultChart.label.failure"),
        id: "failure",
      });
    }
    if (metricResult.errors > 0) {
      data.push({
        value: metricResult.errors,
        name: t("MetricResultChart.label.error"),
        id: "error",
      });
    }

    return data;
  }, [metricResult.successes, metricResult.failures, metricResult.errors, t]);

  const buildChart = useCallback(
    (): EChartsOption => ({
      legend: {
        bottom: 8,
        left: "center",
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          top: -16,
          avoidLabelOverlap: false,
          itemStyle: {
            color: (params) => {
              const id =
                params.data &&
                typeof params.data === "object" &&
                "id" in params.data
                  ? params.data.id
                  : undefined;

              switch (id) {
                case "success":
                  return hexColor("--heroui-success");
                case "failure":
                  return hexColor("--heroui-danger");
                case "error":
                  return hexColor("--heroui-warning");
              }

              return ERROR_FALLBACK_COLOR;
            },
          },
          label: {
            show: true,
            position: "inside",
            formatter: "{c}",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "1em",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    }),
    [data],
  );

  const option = useEchartsOption(buildChart);

  const [loading, setLoading] = useState(true);

  const stopLoading = useCallback(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading, setLoading]);

  return (
    <div className={className}>
      {title && <div className="text-small text-center">{title}</div>}
      <EChartsLoadingWrapper className="w-80 h-64" loading={loading}>
        {option && <ECharts option={option} onRendered={stopLoading} />}
      </EChartsLoadingWrapper>
    </div>
  );
};
