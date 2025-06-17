import { dashboardGetData } from "@/app/client";
import { queryDefinition } from "@/app/utils/react-query";

export const DASHBOARD_DATA_QUERY_KEY = "dashboardData";
export const dashboardDataQueryDefinition = queryDefinition({
  options: {
    queryKey: [DASHBOARD_DATA_QUERY_KEY],
  },
  query: dashboardGetData<true>,
});
