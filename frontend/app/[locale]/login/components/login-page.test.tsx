import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { LoginPage, LoginPageProps } from "./login-page";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));
const signInMock = vi.mocked(signIn);

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));
const useSearchParamsMock = vi.mocked(useSearchParams);

const mockProviders: LoginPageProps["providers"] = [
  { id: "google", name: "Google" },
  { id: "github", name: "GitHub" },
];

describe("LoginPage", () => {
  beforeEach(() => {
    mockCallbackUrl();
  });

  it("should render the login page with multiple providers", () => {
    render(<LoginPage providers={mockProviders} />);

    expect(
      screen.getByText('LoginButton.text - {"provider":"Google"}'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('LoginButton.text - {"provider":"GitHub"}'),
    ).toBeInTheDocument();
  });

  it("should render a spinner when there is only one provider", () => {
    render(<LoginPage providers={[{ id: "google", name: "Google" }]} />);

    expect(
      screen.getByLabelText("LoginPage.spinner.label"),
    ).toBeInTheDocument();
  });

  it("should call signIn when there is only one provider", () => {
    render(<LoginPage providers={[{ id: "google", name: "Google" }]} />);

    expect(signInMock).toHaveBeenCalledWith("google", { redirectTo: "/" });
  });

  it("should call signIn when there is only one provider and use callback URL from query params", () => {
    mockCallbackUrl("/redirect-url");

    render(<LoginPage providers={[{ id: "google", name: "Google" }]} />);

    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/redirect-url",
    });
  });

  const mockCallbackUrl = (callbackUrl: string | undefined = undefined) => {
    useSearchParamsMock.mockReset();
    useSearchParamsMock.mockReturnValue({
      get: vi.fn().mockReturnValue(callbackUrl),
    } as unknown as ReadonlyURLSearchParams);
  };
});
