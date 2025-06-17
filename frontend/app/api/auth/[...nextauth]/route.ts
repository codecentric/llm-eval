import { NextRequest } from "next/server";

import { handlers } from "@/auth";

// to get auth working in k8s we currently use this workaround from
// https://github.com/nextauthjs/next-auth/issues/10928#issuecomment-2162893683
const reqWithTrustedOrigin = (req: NextRequest): NextRequest => {
  if (process.env.AUTH_TRUST_HOST !== "true") return req;
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host");
  if (!proto || !host) {
    console.warn("Missing x-forwarded-proto or x-forwarded-host headers.");
    return req;
  }
  const envOrigin = `${proto}://${host}`;
  const { href, origin } = req.nextUrl;
  return new NextRequest(href.replace(origin, envOrigin), req);
};

export const GET = (req: NextRequest) => {
  return handlers.GET(reqWithTrustedOrigin(req));
};

export const POST = (req: NextRequest) => {
  return handlers.POST(reqWithTrustedOrigin(req));
};
