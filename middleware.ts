import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

interface AuthToken {
  role?: "admin" | "owner" | "user";
  name?: string;
  email?: string;
}

export default withAuth(
  function middleware(
    request: NextRequest & { nextauth: { token: AuthToken | null } }
  ) {
    // If the user is not authenticated and trying to access protected routes
    if (!request.nextauth.token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const token = request.nextauth.token;

    // For admin routes, check if user has admin/owner role
    if (
      request.url.includes("/dashboard/admin") &&
      token.role !== "admin" &&
      token.role !== "owner"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow access to non-admin routes for all authenticated users
        if (!req.url?.includes("/dashboard/admin")) {
          return !!token;
        }

        // Only allow admin/owner to access admin routes
        return token?.role === "admin" || token?.role === "owner";
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes under /dashboard and /api
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/controls/:path*",
    "/api/domains/:path*",
    "/api/level-settings/:path*",
    "/api/assessments/:path*",
  ],
};
