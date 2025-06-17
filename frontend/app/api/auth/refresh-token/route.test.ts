import { Session } from "next-auth";

import { POST } from "@/app/api/auth/refresh-token/route";
import {
  ProviderSettings,
  TokenRefreshResponse,
} from "@/app/auth/provider-settings";
import { auth, getProviderSettings, unstable_update } from "@/auth";

vi.mock("@/auth");

const mockedAuth = vi.mocked(auth as () => Promise<Session | undefined>);
const mockedGetProviderSettings = vi.mocked(getProviderSettings);

describe("/auth/refresh-token", () => {
  const now = new Date(0);
  const refreshToken = "refreshToken";
  const provider = "provider";
  const session: Session = {
    provider,
    expires: "",
    refreshToken,
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should fetch a new token and update the session", async () => {
    mockedAuth.mockResolvedValue(session);

    const newTokensResponse: TokenRefreshResponse = {
      access_token: "newAccessToken",
      refresh_token: "newRefreshToken",
      expires_in: 100,
    };
    const getNewToken = vi.fn();
    getNewToken.mockResolvedValue(newTokensResponse);

    const providerSettings: ProviderSettings = {
      id: provider,
      getNewToken,
    } as unknown as ProviderSettings;

    mockedGetProviderSettings.mockReturnValue([providerSettings]);

    vi.useFakeTimers();
    vi.setSystemTime(now);

    const response = await POST();

    vi.useRealTimers();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ expiresIn: 100 * 1000 });
    expect(unstable_update).toHaveBeenCalledWith({
      refreshToken: newTokensResponse.refresh_token ?? session.refreshToken,
      accessToken: newTokensResponse.access_token,
      accessTokenExpiresAt: 100,
    });
  });

  it("should fail if there is no active session", async () => {
    mockedAuth.mockResolvedValue(undefined);

    const response = await POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual("No refresh token.");
  });

  it("should fail if the provider has no toke refresh function", async () => {
    mockedAuth.mockResolvedValue(session);

    const providerSettings: ProviderSettings = {
      id: provider,
    } as unknown as ProviderSettings;

    mockedGetProviderSettings.mockReturnValue([providerSettings]);

    const response = await POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual(
      "Provider has no token refresh function.",
    );
  });

  it("should fail if no provider was found", async () => {
    mockedAuth.mockResolvedValue(session);

    const providerSettings: ProviderSettings = {
      id: "other provider",
    } as unknown as ProviderSettings;

    mockedGetProviderSettings.mockReturnValue([providerSettings]);

    const response = await POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual(
      "Provider has no token refresh function.",
    );
  });

  it("should fail with an internal server error in case of an exception", async () => {
    const error = Error("ERR");
    mockedAuth.mockRejectedValue(error);

    const response = await POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual("Failed to refresh token.");
  });
});
