import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

const publicPages = ["/login"];

type GenericMiddleware = ReturnType<typeof createMiddleware>;

const intlMiddleware = createMiddleware(routing);

const authMiddleware = auth((req) => {
  if (req.nextUrl.pathname.startsWith("/api/backend/")) {
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${req.auth?.accessToken}`);
    return NextResponse.rewrite(
      `${process.env.BACKEND_BASE_URL}${req.nextUrl.pathname.replace("/api/backend", "")}${req.nextUrl.search}`,
      {
        request: {
          headers,
        },
      },
    );
  }

  const accessTokenExpired =
    Date.now() - (req.auth?.accessTokenExpiresAt ?? 0) * 1000 > 0;

  if (
    !req.auth ||
    // ignore server actions so that the fetch request doesn't redirect
    (!req.headers.get("Next-Action") && accessTokenExpired)
  ) {
    const loginUrl = new URL(
      `/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
      req.nextUrl.origin,
    );
    return Response.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export default function middleware(req: NextRequest) {
  // nosemgrep
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i",
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as GenericMiddleware)(req);
  }
}

export const config = {
  matcher: ["/(api/backend/.*)", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
