import NextAuth from "next-auth";

import {
  parseProvidersSettings,
  ProviderSettings,
} from "@/app/auth/provider-settings";

const providerSettings = parseProvidersSettings();

export const getProviderSettings = (): Omit<ProviderSettings, "provider">[] =>
  providerSettings;

// noinspection JSUnusedGlobalSymbols
export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: providerSettings.map(
    (providerSettings) => providerSettings.provider,
  ),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ account, token, trigger, session }) => {
      if (account) {
        token.provider = account.provider;
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
      }

      if (trigger === "update") {
        token.access_token = session?.accessToken;
        token.refresh_token = session?.refreshToken;
        token.expires_at = session?.accessTokenExpiresAt;
      }

      return token;
    },
    session: ({ session, token }) => {
      session.provider = token.provider;
      session.accessToken = token.access_token;
      session.accessTokenExpiresAt = token.expires_at;
      session.refreshToken = token.refresh_token;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    provider: string;
    accessToken?: string;
    accessTokenExpiresAt?: number;
    refreshToken?: string;
  }
}

declare module "@auth/core/jwt" {
  // noinspection JSUnusedGlobalSymbols
  interface JWT {
    provider: string;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
  }
}
