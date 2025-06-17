import { auth, getProviderSettings, unstable_update } from "@/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.refreshToken) {
      return new Response(JSON.stringify("No refresh token."), {
        status: 500,
      });
    }

    const getNewToken = getProviderSettings().find(
      (settings) => settings.id === session.provider,
    )?.getNewToken;

    if (!getNewToken) {
      return new Response(
        JSON.stringify("Provider has no token refresh function."),
        {
          status: 500,
        },
      );
    }

    const newTokens = await getNewToken(session.refreshToken);

    const expiresAt = (Date.now() + newTokens.expires_in * 1000) / 1000;

    await unstable_update({
      refreshToken: newTokens.refresh_token ?? session.refreshToken,
      accessToken: newTokens.access_token,
      accessTokenExpiresAt: expiresAt,
    });

    return new Response(
      JSON.stringify({ expiresIn: newTokens.expires_in * 1000 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.warn(e);

    return new Response(JSON.stringify("Failed to refresh token."), {
      status: 500,
    });
  }
}
