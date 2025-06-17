import { useEffect } from "react";

import { EChartsProps } from "@/app/components/echarts";

vi.mock("@/app/components/echarts", () => {
  const MockChart: React.FC<EChartsProps> = ({ onFinished, onRendered }) => {
    useEffect(() => {
      onFinished?.();
      onRendered?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div>CHART</div>;
  };

  return {
    ECharts: MockChart,
  };
});
