import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { withAuth } from 'next-auth/middleware';

interface AuthToken {
  role?: 'admin' | 'owner' | 'user';
  name?: string;
  email?: string;
}

export default withAuth(
  function middleware(request) {
    // If the user is not authenticated and trying to access protected routes
    if (!request.nextauth.token) {
      return NextResponse.redirect('/login');
    }

    const token = request.nextauth.token as AuthToken;

    // For admin routes, check if user has admin/owner role
    if (token.role !== 'admin' && token.role !== 'owner') {
      return NextResponse.redirect('/dashboard');
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow access to non-admin routes for all authenticated users
        if (!req.nextUrl?.pathname.startsWith('/dashboard/admin')) {
          return !!token;
        }

        // Only allow admin/owner to access admin routes
        return token?.role === 'admin' || token?.role === 'owner';
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect all routes under /dashboard
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/controls/:path*',
    '/api/domains/:path*',
    '/api/level-settings/:path*',
  ],
};
