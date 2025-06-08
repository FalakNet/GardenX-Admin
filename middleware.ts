import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // Get the session cookie
  const session = request.cookies.get("admin_session")?.value

  // If accessing login page and already authenticated, redirect to dashboard
  if (isPublicPath && session === "authenticated") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // If accessing protected route without authentication, redirect to login
  if (!isPublicPath && session !== "authenticated") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
