import { auth } from "@/auth";
import { Constants } from "./shared/lib/constants";
import { EnvSettings } from "./shared/lib/envSettings";
import i18nConfig from "@/i18n.config";
import { i18nRouter } from "next-i18n-router";
import { NextRequest, NextResponse } from "next/server";
import { supportedLocales } from "@/shared/lib/locales";
import Utils from "@/shared/lib/utils";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthenticated = !!session;

  // A workaround to suppress errors in /signin caused by the conflict with the parallel route @employees
  if (isAuthenticated) {
    if (Utils.isSigninUrl(request.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL(
          `${request.nextUrl.origin}${Utils.stripSigninUrl(
            request.nextUrl.pathname
          )}`
        )
      );
    }
  } else if (
    !["/", ...Object.values(supportedLocales)].some(
      (path) => path === request.nextUrl.pathname
    ) &&
    !Utils.isSigninUrl(request.nextUrl.pathname)
  ) {
    if (!EnvSettings.shouldUseMockupDataWhenUnauthenticated) {
      return NextResponse.redirect(new URL(`${request.nextUrl.origin}`));
    }
  }

  request.headers.append(Constants.headerPathname, request.nextUrl.pathname);
  request.headers.append(Constants.headerSearch, request.nextUrl.search);
  return i18nRouter(request, i18nConfig);
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|.{3}?signin).*)",
};
