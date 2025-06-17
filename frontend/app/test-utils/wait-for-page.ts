import { screen, within } from "@testing-library/react";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

export const waitForPageRender = async (pageInfo: PageInfo) => {
  const pageTitle = await screen.findByTestId("page-title");

  await within(pageTitle).findByText(
    pageInfo.nameArgs
      ? `${pageInfo.name} - ${JSON.stringify(pageInfo.nameArgs)}`
      : pageInfo.name,
  );
};
