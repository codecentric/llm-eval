import { MdAdd } from "react-icons/md";

import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const newLlmEndpointPage: PageInfo = {
  key: "newLlmEndpoint",
  name: "NewLLMEndpointPage.name",
  href: "/llm-endpoints/new",
  icon: <MdAdd />,
  parent: llmEndpointsPage,
};
