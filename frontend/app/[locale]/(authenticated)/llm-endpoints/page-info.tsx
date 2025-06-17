import { LuBrain } from "react-icons/lu";

import { homePage, PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const llmEndpointsPage: PageInfo = {
  key: "llmEndpoints",
  name: "LLMEndpointsPage.name",
  href: "/llm-endpoints",
  icon: <LuBrain />,
  parent: homePage,
};
