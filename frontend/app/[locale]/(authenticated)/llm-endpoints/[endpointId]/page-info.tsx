import { MdRemoveRedEye } from "react-icons/md";

import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const llmEndpointDetailsPage = (
  endpointId: string,
  name?: string,
): PageInfo => ({
  key: "llmEndpointDetails",
  name: "LLMEndpointDetailsPage.name",
  shortName: "LLMEndpointDetailsPage.shortName",
  nameArgs: { endpointId, name: name ?? endpointId },
  href: `/llm-endpoints/${endpointId}`,
  icon: <MdRemoveRedEye />,
  parent: llmEndpointsPage,
});
