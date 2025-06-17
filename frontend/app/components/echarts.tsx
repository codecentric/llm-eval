"use client";

import useResizeObserver from "@react-hook/resize-observer";
import { cx } from "classix";
import { useTheme } from "next-themes";
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import echarts from "@/app/echarts";

import type {
  ECharts as EChartsType,
  EChartsCoreOption,
  SetOptionOpts,
} from "echarts/core";

const chartThemeMap: Record<string, string | undefined> = {
  light: "light",
  dark: "dark",
};

const useChartTheme = () => {
  const { resolvedTheme } = useTheme();

  const theme = useMemo(
    () => (resolvedTheme ? chartThemeMap[resolvedTheme] : undefined) ?? "light",
    [resolvedTheme],
  );

  return theme;
};

const useChartEvent = (
  chartRef: React.RefObject<HTMLDivElement | null>,
  eventName: string,
  eventHandler: (() => void) | undefined,
) => {
  const theme = useChartTheme();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (eventHandler && chartRef.current !== null) {
      const chart = echarts.getInstanceByDom(chartRef.current);

      if (chart) {
        chart.on(eventName, eventHandler);

        cleanup = () => {
          if (!chart.isDisposed()) {
            chart.off(eventName, eventHandler);
          }
        };
      }
    }

    return cleanup;
  }, [eventName, eventHandler, theme, chartRef]);
};

export type EChartsEventHandlerFunction = (
  chart: EChartsType,
  ...args: unknown[]
) => void;

type EventWithHandler = readonly [
  name: string,
  handler: EChartsEventHandlerFunction,
];
type EventWithHandlerAndContext = readonly [
  name: string,
  handler: EChartsEventHandlerFunction,
  context: unknown,
];
type EventWithQueryAndHandler = readonly [
  name: string,
  query: string | object,
  handler: EChartsEventHandlerFunction,
];
type EventWithQueryAndHandlerAndContext = readonly [
  name: string,
  query: string | object,
  handler: EChartsEventHandlerFunction,
  context: unknown,
];

export type EChartsEvents = readonly (
  | EventWithHandler
  | EventWithHandlerAndContext
  | EventWithQueryAndHandler
  | EventWithQueryAndHandlerAndContext
)[];

const isEventWithQuery = (
  event: EChartsEvents[number],
): event is EventWithQueryAndHandler | EventWithQueryAndHandlerAndContext =>
  typeof event[1] !== "function";

export type EChartsProps = {
  className?: string;
  option: EChartsCoreOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  events?: EChartsEvents;
  onFinished?: () => void;
  onRendered?: () => void;
};

export const ECharts: React.FC<EChartsProps> = ({
  option,
  className,
  style,
  settings,
  events,
  onFinished,
  onRendered,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [initialResize, setInitialResize] = useState(true);

  const theme = useChartTheme();

  useResizeObserver(chartRef, (entry) => {
    // We need to skip the initial resize event as this would prevent the initial chart animations
    if (initialResize) {
      setInitialResize(false);
      return;
    }

    const chart = echarts.getInstanceByDom(entry.target as HTMLElement);

    if (chart && !chart.isDisposed()) {
      chart.resize();
    }
  });

  useEffect(() => {
    let chart: EChartsType | undefined;
    if (chartRef.current !== null) {
      chart = echarts.init(chartRef.current, theme);
    }

    return () => {
      chart?.dispose();
    };
  }, [theme]);

  useChartEvent(chartRef, "rendered", onRendered);
  useChartEvent(chartRef, "finished", onFinished);

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = echarts.getInstanceByDom(chartRef.current);
      chart?.setOption(option, settings);
    }
  }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    if (chartRef.current !== null && events) {
      const chart = echarts.getInstanceByDom(chartRef.current);

      if (chart) {
        for (const event of events) {
          if (isEventWithQuery(event)) {
            if (event.length === 3) {
              chart.on(event[0], event[1], (...params) =>
                event[2](chart, ...params),
              );
            } else {
              chart.on(
                event[0],
                event[1],
                (...params) => event[2](chart, ...params),
                event[3],
              );
            }
          } else {
            if (event.length === 2) {
              chart.on(event[0], (...params) => event[1](chart, ...params));
            } else {
              chart.on(
                event[0],
                (...params) => event[1](chart, ...params),
                event[2],
              );
            }
          }
        }

        return () => {
          if (!chart.isDisposed()) {
            for (const event of events) {
              chart.off(event[0]);
            }
          }
        };
      }
    }
  }, [events]);

  return (
    <div
      ref={chartRef}
      className={cx("w-full", "h-full", className)}
      style={style}
    />
  );
};
