import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MdAdd } from "react-icons/md";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { showContextHelpAtom } from "@/app/state/context-help";
import { JotaiTestProvider } from "@/app/test-utils/jotai";

import { PageAction } from "./page-action";
import { PageContent } from "./page-content";

const testPageInfo: PageInfo = {
  name: "test",
  href: "/test",
  key: "test",
};

describe("PageContent", () => {
  it("should render content without help page", () => {
    render(<PageContent pageInfo={testPageInfo}>My test content.</PageContent>);

    expect(screen.getByText("My test content.")).toBeInTheDocument();
  });

  it("should render content with help page if global state value is true", () => {
    const HelpPage = () => {
      return <div>My help page.</div>;
    };

    render(
      <JotaiTestProvider initialValues={[[showContextHelpAtom, true]]}>
        <PageContent pageInfo={testPageInfo} helpPage={<HelpPage />}>
          My test content.
        </PageContent>
      </JotaiTestProvider>,
    );

    expect(screen.getByText("My test content.")).toBeInTheDocument();
    expect(screen.getByText("My help page.")).toBeInTheDocument();
  });

  it("should render content with help page if global state value is false and toggle button is clicked", async () => {
    const user = userEvent.setup();

    const HelpPage = () => {
      return <div>My help page.</div>;
    };

    render(
      <JotaiTestProvider initialValues={[[showContextHelpAtom, false]]}>
        <PageContent pageInfo={testPageInfo} helpPage={<HelpPage />}>
          My test content.
        </PageContent>
      </JotaiTestProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "PageHeader.showContextHelp" }),
    );

    expect(screen.getByText("My test content.")).toBeInTheDocument();
    expect(screen.getByText("My help page.")).toBeInTheDocument();
  });

  it("should render content without help page if global state value is true and toggle button is clicked", async () => {
    const user = userEvent.setup();

    const HelpPage = () => {
      return <div>My help page.</div>;
    };

    render(
      <JotaiTestProvider initialValues={[[showContextHelpAtom, true]]}>
        <PageContent pageInfo={testPageInfo} helpPage={<HelpPage />}>
          My test content.
        </PageContent>
      </JotaiTestProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "PageHeader.hideContextHelp" }),
    );

    expect(screen.getByText("My test content.")).toBeInTheDocument();
    expect(screen.queryByText("My help page.")).not.toBeInTheDocument();
  });

  it("should render title end content", () => {
    const TitleEnd = () => {
      return <div>Title end.</div>;
    };

    render(
      <PageContent pageInfo={testPageInfo} titleEnd={<TitleEnd />}>
        My test content.
      </PageContent>,
    );

    expect(screen.getByText("Title end.")).toBeInTheDocument();
  });

  it("should render page actions", () => {
    render(
      <PageContent
        pageInfo={testPageInfo}
        actions={[
          <PageAction key="1" text="Action 1" icon={MdAdd} />,
          <PageAction key="2" text="Action 2" icon={MdAdd} />,
        ]}
      >
        My test content.
      </PageContent>,
    );

    expect(
      screen.getByRole("button", { name: "Action 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Action 2" }),
    ).toBeInTheDocument();
  });
});
