import { useEffect, useState } from "react";

import type { EChartsOption } from "echarts";

export const useEchartsOption = (builder: () => EChartsOption) => {
  const [options, setOptions] = useState<EChartsOption | undefined>(undefined);

  useEffect(() => {
    setOptions(builder());
  }, [builder]);

  return options;
};
