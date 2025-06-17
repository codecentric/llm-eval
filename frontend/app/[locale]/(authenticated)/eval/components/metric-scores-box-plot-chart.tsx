import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";

import { MetricScores } from "@/app/client";
import { ECharts } from "@/app/components/echarts";
import { EChartsLoadingWrapper } from "@/app/components/echatys-loading-wrapper";
import { useEchartsOption } from "@/app/hooks/use-echarts-options";
import { hexColor } from "@/app/utils/css-colors";

import type { EChartsOption } from "echarts";

export type MetricScoresBoxPlotChartProps = {
  metricScores: MetricScores[];
  className?: string;
};

export const MetricScoresBoxPlotChart: React.FC<
  MetricScoresBoxPlotChartProps
> = ({ metricScores, className }) => {
  const t = useTranslations();

  const dataSource = useMemo(
    () => metricScores.map(({ scores }) => scores.map(({ score }) => score)),
    [metricScores],
  );

  const buildOptions = useCallback(
    (): EChartsOption => ({
      dataset: [
        {
          id: "source",
          source: dataSource,
        },
        {
          id: "boxplot",
          transform: {
            type: "boxplot",
            config: {
              itemNameFormatter: ({ value }: { value: number }) =>
                metricScores[value].name,
            },
          },
        },
        {
          id: "outliers",
          fromDatasetId: "boxplot",
          fromTransformResult: 1,
        },
      ],
      grid: {
        top: 16,
        left: 32,
        right: 32,
        bottom: 32,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        nameGap: 30,
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: false,
        },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: hexColor("--heroui-content1"),
        textStyle: {
          color: hexColor("--heroui-content1-foreground"),
        },
        borderWidth: 1,
      },
      series: [
        {
          name: t("MetricScoresBoxPlotChart.series.boxplot"),
          type: "boxplot",
          datasetId: "boxplot",
        },
        {
          name: t("MetricScoresBoxPlotChart.series.outliers"),
          type: "scatter",
          datasetId: "outliers",
        },
      ],
    }),
    [metricScores, dataSource, t],
  );

  const option = useEchartsOption(buildOptions);

  const [loading, setLoading] = useState(true);

  const stopLoading = useCallback(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading, setLoading]);

  return (
    <div className={className}>
      <EChartsLoadingWrapper className="h-[400px]" loading={loading}>
        {option && (
          <ECharts
            option={option}
            settings={{ notMerge: true }}
            onRendered={stopLoading}
          />
        )}
      </EChartsLoadingWrapper>
    </div>
  );
};
