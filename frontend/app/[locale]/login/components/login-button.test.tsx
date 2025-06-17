import "@/app/test-utils/mock-intl";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { LoginButton } from "./login-button";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));
const useSearchParamsMock = vi.mocked(useSearchParams);

describe("LoginButton", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue({
      get: vi.fn().mockReturnValue("/callback"),
    } as unknown as ReadonlyURLSearchParams);
  });

  it("should render the login button with the correct provider name", () => {
    render(<LoginButton providerId="google" providerName="Google" />);
    expect(
      screen.getByText('LoginButton.text - {"provider":"Google"}'),
    ).toBeInTheDocument();
  });

  it("should call signIn with the correct provider ID when clicked", async () => {
    const user = userEvent.setup();

    render(<LoginButton providerId="google" providerName="Google" />);
    await user.click(
      screen.getByRole("button", {
        name: 'LoginButton.text - {"provider":"Google"}',
      }),
    );
    expect(signIn).toHaveBeenCalledWith("google", {
      redirectTo: "/callback",
    });
  });
});
