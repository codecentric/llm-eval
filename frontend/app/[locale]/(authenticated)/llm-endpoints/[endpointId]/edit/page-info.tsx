import { MdEdit } from "react-icons/md";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { EditOrigin } from "@/app/types/edit-origin";
import { buildQueryParams } from "@/app/utils/url";

export const llmEndpointEditPage = ({
  endpointId,
  name,
  origin,
}: {
  endpointId: string;
  name?: string;
  origin?: EditOrigin;
}): PageInfo => ({
  key: "llmEndpointEdit",
  name: "LLMEndpointEditPage.name",
  shortName: "LLMEndpointEditPage.shortName",
  nameArgs: { endpointId, name: name ?? endpointId },
  href: `/llm-endpoints/${endpointId}/edit${buildQueryParams({ origin })}`,
  icon: <MdEdit />,
  parent: llmEndpointDetailsPage(endpointId, name),
});
