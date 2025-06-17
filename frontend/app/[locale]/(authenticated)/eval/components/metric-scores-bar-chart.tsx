import { type EChartsOption } from "echarts";
import React, { useCallback, useMemo, useState } from "react";

import { MetricScores } from "@/app/client";
import { ECharts } from "@/app/components/echarts";
import { EChartsLoadingWrapper } from "@/app/components/echatys-loading-wrapper";
import { useEchartsOption } from "@/app/hooks/use-echarts-options";

type Bucket = {
  start: number;
  end: number;
};

const buildBuckets = (interval: number) => {
  const buckets: Bucket[] = [];
  const increment = interval * 100;

  for (let i = 0; i < 100; i = i + increment) {
    const start = i;
    const end = i + increment >= 100 ? 100 : i + increment;

    buckets.push({ start, end });
  }

  return buckets;
};

const countScores = (metricScores: MetricScores, buckets: Bucket[]) =>
  buckets.map(
    ({ start, end }) =>
      metricScores.scores.filter((score) => {
        const calcScore = score.score * 100;
        return (
          calcScore >= start &&
          (end === 100 ? calcScore <= end : calcScore < end)
        );
      }).length,
  );

export type MetricScoresBarChartProps = {
  interval: number;
  metricScores: MetricScores[];
  className?: string;
  onReady?: () => void;
};

export const MetricScoresBarChart: React.FC<MetricScoresBarChartProps> = ({
  metricScores,
  interval,
  className,
  onReady,
}) => {
  const buckets = useMemo(() => buildBuckets(interval), [interval]);

  const xAxisLabels = useMemo(
    () => buckets.map(({ end }) => (end / 100).toFixed(2)),
    [buckets],
  );

  const buildOptions = useCallback(
    (): EChartsOption => ({
      legend: {
        bottom: 8,
        left: "center",
      },
      grid: {
        top: 16,
        left: 32,
        right: 32,
      },
      xAxis: [
        {
          type: "category",
          data: xAxisLabels,
          show: false,
        },
        {
          type: "category",
          data: [0, ...xAxisLabels.map((label) => Number(label).toString())],
          boundaryGap: false,
          axisTick: { alignWithLabel: true },
          position: "bottom",
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false,
          },
          axisLine: {
            show: true,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: metricScores.map((metricScore) => ({
        name: metricScore.name,
        type: "bar",
        emphasis: {
          focus: "series",
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => (params.value || "").toString(),
        },
        data: countScores(metricScore, buckets),
      })),
    }),
    [metricScores, buckets, xAxisLabels],
  );

  const option = useEchartsOption(buildOptions);

  const [loading, setLoading] = useState(true);

  const onChartFinished = useCallback(() => {
    if (loading) {
      setLoading(false);

      if (onReady) {
        onReady();
      }
    }
  }, [onReady, setLoading, loading]);

  return (
    <div className={className}>
      <EChartsLoadingWrapper className="h-[400px]" loading={loading}>
        {option && (
          <ECharts
            option={option}
            settings={{ notMerge: true }}
            onRendered={onChartFinished}
          />
        )}
      </EChartsLoadingWrapper>
    </div>
  );
};
