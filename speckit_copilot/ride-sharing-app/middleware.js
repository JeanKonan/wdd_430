import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/rides/create', '/my-rides', '/my-bookings'];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing a protected route
  if (isProtectedRoute) {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For now, just check if token exists (full verification happens on the backend)
    // Token is valid, allow access
    return NextResponse.next();
  }

  // If accessing an auth route (login/register) while already logged in
  if (isAuthRoute && token) {
    // Token exists, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
      // Token is invalid, clear it and allow access to auth route
      const response = NextResponse.next();
  }

  // For all other routes, allow access
  return NextResponse.next();
}

// Configure which routes should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
