import { CognitoProfile } from "@auth/core/providers/cognito";
import { OAuth2Config } from "@auth/core/providers/oauth";

import {
  parseProvidersSettings,
  ProviderSettings,
} from "@/app/auth/provider-settings";
import { expectFunction } from "@/app/test-utils/assertions";

describe("parseProvidersSettings", () => {
  it("should parse keycloak configuration", () => {
    setupEnv({
      NEXT_PUBLIC_AUTH_PROVIDERS: "TEST",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_TYPE: "keycloak",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ID: "id",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_NAME: "name",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ALLOW_ACCOUNT_LINKING: "false",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ISSUER: "https://issuer.com",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_CLIENT_ID: "test-client",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_CLIENT_SECRET: "client-secret",
    });

    const settings = parseProvidersSettings();

    expect(settings).toEqual([
      {
        type: "keycloak",
        name: "name",
        id: "id",
        getNewToken: expect.toSatisfy((value) => typeof value === "function"),
        provider: {
          type: "oidc",
          id: "keycloak",
          name: "Keycloak",
          options: {
            allowDangerousEmailAccountLinking: false,
            clientId: "test-client",
            clientSecret: "client-secret",
            id: "id",
            issuer: "https://issuer.com",
            name: "name",
          },
          style: {
            brandColor: "#428bca",
          },
        },
      } satisfies ProviderSettings,
    ]);
  });

  it("should have correct keycloak token refresh function", async () => {
    setupEnv({
      NEXT_PUBLIC_AUTH_PROVIDERS: "TEST",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_TYPE: "keycloak",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ID: "id",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_NAME: "name",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ALLOW_ACCOUNT_LINKING: "false",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ISSUER: "https://example.com",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_CLIENT_ID: "test-client",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_CLIENT_SECRET: "client-secret",
    });

    const settings = parseProvidersSettings();

    const refreshToken = "rfToken";
    const tokens = {
      accessToken: "accessToken",
    };

    fetchMock.doMock();
    fetchMock.mockResponse(() => JSON.stringify(tokens));

    const newTokens = await settings[0].getNewToken?.(refreshToken);

    expect(newTokens).toEqual(tokens);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/protocol/openid-connect/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: "test-client",
          client_secret: "client-secret",
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        next: {
          revalidate: 60,
        },
      },
    );
  });

  it("should parse cognito configuration with client secret", () => {
    setupEnv({
      NEXT_PUBLIC_AUTH_PROVIDERS: "TEST",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_TYPE: "cognito",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ID: "id",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_NAME: "name",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ALLOW_ACCOUNT_LINKING: "false",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ID: "test-client",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ISSUER: "https://issuer.com",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_SECRET: "client-secret",
    });

    const settings = parseProvidersSettings();

    expect(settings).toEqual([
      {
        type: "cognito",
        name: "name",
        id: "id",
        getNewToken: undefined,
        provider: {
          type: "oidc",
          id: "cognito",
          name: "Cognito",
          options: {
            allowDangerousEmailAccountLinking: false,
            client: undefined,
            clientId: "test-client",
            clientSecret: "client-secret",
            id: "id",
            issuer: "https://issuer.com",
            name: "name",
            profile: expectFunction,
          },
          style: {
            brandColor: "#C17B9E",
          },
        },
      } satisfies ProviderSettings,
    ]);
  });

  it("should parse cognito configuration without client secret", () => {
    setupEnv({
      NEXT_PUBLIC_AUTH_PROVIDERS: "TEST",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_TYPE: "cognito",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ID: "id",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_NAME: "name",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ALLOW_ACCOUNT_LINKING: "false",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ID: "test-client",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ISSUER: "https://issuer.com",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_SECRET: "",
    });

    const settings = parseProvidersSettings();

    expect(settings).toEqual([
      {
        type: "cognito",
        name: "name",
        id: "id",
        getNewToken: undefined,
        provider: {
          type: "oidc",
          id: "cognito",
          name: "Cognito",
          options: {
            allowDangerousEmailAccountLinking: false,
            client: {
              token_endpoint_auth_method: "none",
            },
            clientId: "test-client",
            clientSecret: "",
            id: "id",
            issuer: "https://issuer.com",
            name: "name",
            profile: expectFunction,
          },
          style: {
            brandColor: "#C17B9E",
          },
        },
      } satisfies ProviderSettings,
    ]);
  });

  it("should have correct cognito profile to user mapping", async () => {
    setupEnv({
      NEXT_PUBLIC_AUTH_PROVIDERS: "TEST",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_TYPE: "cognito",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ID: "id",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_NAME: "name",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_ALLOW_ACCOUNT_LINKING: "false",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ID: "test-client",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_ISSUER: "https://issuer.com",
      NEXT_PUBLIC_AUTH_PROVIDER_TEST_COGNITO_SECRET: "client-secret",
    });

    const settings = parseProvidersSettings();

    const profile: CognitoProfile = {
      name: "name",
      sub: "sub",
      email: "email",
      picture: "picture",
    };

    const config = settings[0].provider as OAuth2Config<CognitoProfile>;
    const user = await config.options?.profile?.(profile, {});

    expect(user).toEqual({
      ...profile,
      id: profile.sub,
      image: profile.picture,
    });
  });

  const setupEnv = (variables: Record<string, string>) => {
    Object.entries(variables).forEach(([key, value]) => {
      process.env[key] = value;
    });
  };
});
