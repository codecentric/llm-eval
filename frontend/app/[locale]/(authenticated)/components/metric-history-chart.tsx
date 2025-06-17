import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { MetricResultHistory } from "@/app/[locale]/hooks/use-collect-metric-results-history-data";
import { ECharts, EChartsEvents } from "@/app/components/echarts";
import { EChartsLoadingWrapper } from "@/app/components/echatys-loading-wrapper";
import { useEchartsOption } from "@/app/hooks/use-echarts-options";
import { cssVar, hexColor } from "@/app/utils/css-colors";
import { useRouter } from "@/i18n/routing";

import type { ECElementEvent, EChartsOption } from "echarts";

export type MetricHistoryChartProps = { history: MetricResultHistory };

export const MetricHistoryChart: React.FC<MetricHistoryChartProps> = ({
  history,
}) => {
  const t = useTranslations();
  const router = useRouter();

  const buildOptions = useCallback(
    (): EChartsOption => ({
      title: {
        text: history.metricName,
        textStyle: {
          fontSize: cssVar("--heroui-font-size-tiny"),
          color: hexColor("--heroui-secondary"),
        },
      },
      legend: {
        right: 32,
        top: 0,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: hexColor("--heroui-content3"),
            color: hexColor("--heroui-content3-foreground"),
          },
        },
      },
      grid: {
        top: 36,
        left: 32,
        right: 32,
        bottom: 8,
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: history.data.map((point) => point.evaluationName),
          axisLabel: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisPointer: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: t("MetricHistoryChart.series.errors"),
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          itemStyle: {
            color: hexColor("--heroui-warning"),
          },
          data: history.data.map((point) => point.errors),
          smooth: false,
          symbol: "rect",
          triggerLineEvent: true,
        },
        {
          name: t("MetricHistoryChart.series.failures"),
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          itemStyle: {
            color: hexColor("--heroui-danger"),
          },
          data: history.data.map((point) => point.failures),
          smooth: false,
          symbol: "rect",
          triggerLineEvent: true,
        },
        {
          name: t("MetricHistoryChart.series.successes"),
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          itemStyle: {
            color: hexColor("--heroui-success"),
          },
          data: history.data.map((point) => point.successes),
          smooth: false,
          symbol: "rect",
          triggerLineEvent: true,
        },
      ],
    }),
    [history, t],
  );

  const option = useEchartsOption(buildOptions);

  const events = useMemo(
    (): EChartsEvents => [
      [
        "click",
        "series.line",
        (chart, e: unknown) => {
          const elementEvent = e as ECElementEvent;

          if (elementEvent.event) {
            const data = chart.convertFromPixel("grid", [
              elementEvent.event.offsetX,
              elementEvent.event.offsetY,
            ]);

            router.push(
              evaluationPage({
                evaluationId: history.data[data[0]].evaluationId,
              }).href,
            );
          }
        },
      ],
    ],
    [history, router],
  );

  const [loading, setLoading] = useState(true);

  const stopLoading = useCallback(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading, setLoading]);

  return (
    <EChartsLoadingWrapper
      className="h-[300px] mt-4 last:mb-4"
      loading={loading}
    >
      {option && (
        <ECharts
          option={option}
          settings={{ notMerge: true }}
          onRendered={stopLoading}
          events={events}
        />
      )}
    </EChartsLoadingWrapper>
  );
};
