import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";

import { PageTab, TabbedPageContent } from "./tabbed-page-content";

const testPageInfo: PageInfo = {
  name: "test",
  href: "/test",
  key: "test",
};

describe("TabbedPageContent", () => {
  const tabs: PageTab[] = [
    {
      key: "t1",
      title: "Tab 1",
      content: <div>t1 content</div>,
      url: "/test1",
    },
    {
      key: "t2",
      title: "Tab 2",
      content: <div>t2 content</div>,
      url: "/test2",
    },
  ];

  it.each(tabs.map((tab) => tab.key))(
    "should render the selected tab %s",
    (selectedTab) => {
      render(
        <TabbedPageContent
          pageInfo={testPageInfo}
          tabs={tabs}
          selectedTabKey={selectedTab}
        />,
      );

      expect(screen.getByText(`${selectedTab} content`)).toBeInTheDocument();
    },
  );

  it("should navigate on tab click", async () => {
    const user = userEvent.setup();

    render(
      <TabbedPageContent
        pageInfo={testPageInfo}
        tabs={tabs}
        selectedTabKey={tabs[0].key}
      />,
    );

    await user.click(screen.getByText("Tab 2"));

    expect(mockRouter.push).toHaveBeenCalledWith("/test2");
  });
});
