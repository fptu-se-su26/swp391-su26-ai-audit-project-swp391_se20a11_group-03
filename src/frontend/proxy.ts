import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "collector" | "seller" | "staff" | "admin";

const AUTH_COOKIE = "bidzone_role";

const ROLE_HOME: Record<UserRole, string> = {
  collector: "/dashboard",
  seller: "/inventory",
  staff: "/staff/approvals",
  admin: "/admin/dashboard",
};

const ROLE_PATHS: Record<UserRole, string[]> = {
  collector: [
    "/auctions",
    "/dashboard",
    "/kyc",
    "/messages",
    "/profile",
    "/security",
    "/wallet",
    "/watchlist",
    "/won-items",
  ],
  seller: [
    "/auctions",
    "/earnings",
    "/inventory",
    "/kyc",
    "/messages",
    "/post-item",
    "/profile",
    "/security",
    "/wallet",
  ],
  staff: ["/staff"],
  admin: ["/admin"],
};

function pathStartsWith(pathname: string, protectedPath: string) {
  return pathname === protectedPath || pathname.startsWith(`${protectedPath}/`);
}

function getAllowedRoles(pathname: string): UserRole[] {
  const allowed: UserRole[] = [];
  for (const [role, paths] of Object.entries(ROLE_PATHS) as [
    UserRole,
    string[],
  ][]) {
    if (paths.some((path) => pathStartsWith(pathname, path))) {
      allowed.push(role);
    }
  }

  return allowed;
}

function getValidRole(value: string | undefined): UserRole | null {
  if (
    value === "collector" ||
    value === "seller" ||
    value === "staff" ||
    value === "admin"
  ) {
    return value;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedRoles = getAllowedRoles(pathname);

  if (allowedRoles.length === 0) {
    return NextResponse.next();
  }

  const currentRole = getValidRole(request.cookies.get(AUTH_COOKIE)?.value);

  if (!currentRole) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!allowedRoles.includes(currentRole)) {
    return NextResponse.redirect(new URL(ROLE_HOME[currentRole], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/auctions/:path*",
    "/dashboard/:path*",
    "/earnings/:path*",
    "/inventory/:path*",
    "/kyc/:path*",
    "/messages/:path*",
    "/post-item/:path*",
    "/profile/:path*",
    "/security/:path*",
    "/wallet/:path*",
    "/watchlist/:path*",
    "/won-items/:path*",
  ],
};
