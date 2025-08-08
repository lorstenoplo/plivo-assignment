import { createClient } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow access to auth pages and public pages
  if (pathname.startsWith("/auth") || pathname === "/") {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (user && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // Protected routes - redirect to signin if not authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
