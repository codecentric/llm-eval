import {
  BarChart,
  BoxplotChart,
  LineChart,
  PieChart,
  ScatterChart,
} from "echarts/charts";
import {
  AriaComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

import dark from "./themes/dark.json";
import light from "./themes/light.json";

echarts.use([
  PieChart,
  BarChart,
  BoxplotChart,
  ScatterChart,
  LineChart,
  AriaComponent,
  CanvasRenderer,
  LegendComponent,
  GridComponent,
  TooltipComponent,
  TransformComponent,
  DatasetComponent,
  TitleComponent,
  UniversalTransition,
]);

echarts.registerTheme("dark", dark);
echarts.registerTheme("light", light);

export default echarts;
