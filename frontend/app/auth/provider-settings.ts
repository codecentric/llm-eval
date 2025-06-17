import { Provider } from "@auth/core/providers";
import Cognito, { CognitoProfile } from "@auth/core/providers/cognito";
import Keycloak from "@auth/core/providers/keycloak";

export type TokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export type TokenRefresh = (
  refreshToken: string,
) => Promise<TokenRefreshResponse>;

export type ProviderSettings = {
  type: string;
  id: string;
  name: string;
  provider: Provider;
  getNewToken: TokenRefresh | undefined;
};

const getProviderVariable = (
  providerPrefix: string,
  variableName: string,
): string | undefined => process.env[`${providerPrefix}_${variableName}`];

const normalizeKeys = (key: string) => key.toUpperCase();

export const parseProvidersSettings = () => {
  const providerKeys = process.env.NEXT_PUBLIC_AUTH_PROVIDERS?.split(",") ?? [];

  return providerKeys
    .map(normalizeKeys)
    .map<ProviderSettings>((providerKey) => {
      const providerPrefix = `NEXT_PUBLIC_AUTH_PROVIDER_${providerKey}`;

      const type = getProviderVariable(providerPrefix, "TYPE") as string;
      const id = getProviderVariable(providerPrefix, "ID") as string;
      const name = getProviderVariable(providerPrefix, "NAME") as string;

      const [provider, getNewToken] = createProvider(providerPrefix);

      return {
        type,
        id,
        name,
        provider,
        getNewToken,
      };
    });
};

type ProviderBuilder = (options: {
  providerPrefix: string;
  id: string;
  name: string;
  allowAccountLinking: boolean | undefined;
}) => [Provider, TokenRefresh | undefined];

const createProvider = (
  providerPrefix: string,
): [Provider, TokenRefresh | undefined] => {
  const type = getProviderVariable(providerPrefix, "TYPE") as string;
  const id = getProviderVariable(providerPrefix, "ID") as string;
  const name = getProviderVariable(providerPrefix, "NAME") as string;
  const allowAccountLinking =
    getProviderVariable(
      providerPrefix,
      "ALLOW_ACCOUNT_LINKING",
    )?.toLowerCase() === "true";

  const providerBuilderOptions = {
    providerPrefix,
    id,
    name,
    allowAccountLinking,
  };

  switch (type) {
    case "cognito":
      return createCognitoProvider(providerBuilderOptions);
    case "keycloak":
      return createKeycloakProvider(providerBuilderOptions);
    default:
      throw new Error(`Unknown provider type "${type}"`);
  }
};

const createCognitoProvider: ProviderBuilder = ({
  providerPrefix,
  id,
  name,
  allowAccountLinking,
}) => {
  const clientSecret = getProviderVariable(providerPrefix, "COGNITO_SECRET");
  return [
    Cognito({
      id,
      name,
      clientId: getProviderVariable(providerPrefix, "COGNITO_ID"),
      issuer: getProviderVariable(providerPrefix, "COGNITO_ISSUER"),
      clientSecret,
      client: clientSecret
        ? undefined
        : {
            token_endpoint_auth_method: "none",
          },
      allowDangerousEmailAccountLinking: allowAccountLinking,
      profile: async (profile: CognitoProfile) => {
        return {
          ...profile,
          id: profile.sub,
          image: profile.picture,
        };
      },
    }),
    undefined,
  ];
};

const createKeycloakProvider: ProviderBuilder = ({
  providerPrefix,
  id,
  name,
  allowAccountLinking,
}) => {
  const issuer = getProviderVariable(providerPrefix, "ISSUER");
  const clientId = getProviderVariable(providerPrefix, "CLIENT_ID");
  const clientSecret = getProviderVariable(providerPrefix, "CLIENT_SECRET");

  const getNewToken: TokenRefresh = async (refreshToken) => {
    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      body: new URLSearchParams({
        client_id: clientId ?? "",
        client_secret: clientSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      next: {
        revalidate: 60,
      },
    });

    const tokensOrError = await response.json();

    if (!response.ok) {
      throw tokensOrError;
    }

    return tokensOrError;
  };

  return [
    Keycloak({
      id,
      name,
      clientId,
      clientSecret,
      issuer,
      allowDangerousEmailAccountLinking: allowAccountLinking,
    }),
    getNewToken,
  ];
};
