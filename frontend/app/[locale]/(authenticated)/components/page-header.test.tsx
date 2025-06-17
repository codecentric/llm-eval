import "@/app/test-utils/mock-intl";

import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAtom } from "jotai";
import { MdAdd } from "react-icons/md";

import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { showContextHelpAtom } from "@/app/state/context-help";
import { JotaiTestProvider } from "@/app/test-utils/jotai";

import { PageAction } from "./page-action";
import { PageHeader } from "./page-header";

const parentPageInfo: PageInfo = {
  name: "testParentName",
  href: "/test",
  key: "testParent",
  rawName: true,
};

const testPageInfo: PageInfo = {
  name: "testName",
  href: "/test/child",
  key: "test",
  parent: parentPageInfo,
};

describe("PageHeader", () => {
  it("should render breadcrumbs and title for page info", () => {
    render(<PageHeader pageInfo={testPageInfo} />);

    expect(
      screen.getByRole("heading", { name: testPageInfo.name }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("listitem", { name: parentPageInfo.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("listitem", { name: testPageInfo.name }),
    ).toBeInTheDocument();
  });

  it("should render breadcrumbs with short name if set", () => {
    const pageInfo: PageInfo = {
      ...testPageInfo,
      shortName: "shortName",
    };

    render(<PageHeader pageInfo={pageInfo} />);

    expect(
      screen.getByRole("heading", { name: pageInfo.name }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("listitem", { name: parentPageInfo.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("listitem", { name: pageInfo.shortName }),
    ).toBeInTheDocument();
  });

  it("should render title end after the title", () => {
    render(<PageHeader pageInfo={testPageInfo} titleEnd="END" />);

    expect(screen.getByText(`${testPageInfo.name} END`)).toBeInTheDocument();
  });

  it("should render page actions", () => {
    render(
      <PageHeader
        pageInfo={testPageInfo}
        actions={[
          <PageAction key="1" text="Action 1" icon={MdAdd} />,
          <PageAction key="2" text="Action 2" icon={MdAdd} />,
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Action 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Action 2" }),
    ).toBeInTheDocument();
  });

  it.each([
    [false, "PageHeader.showContextHelp"],
    [true, "PageHeader.hideContextHelp"],
  ])(
    "should render context help button if hasContextHelp is true for showContextHelpAtom value %o and toggle value on click",
    async (showContextHelp, buttonLabel) => {
      const user = userEvent.setup();

      render(
        <JotaiTestProvider
          initialValues={[[showContextHelpAtom, showContextHelp]]}
        >
          <PageHeader pageInfo={testPageInfo} hasContextHelp={true} />
        </JotaiTestProvider>,
      );

      const contextHelpButton = screen.getByRole("button", {
        name: buttonLabel,
      });

      expect(contextHelpButton).toBeInTheDocument();

      await user.click(contextHelpButton);

      const { result } = renderHook(() => useAtom(showContextHelpAtom));

      expect(result.current[0]).toBe(!showContextHelp);
    },
  );
});
