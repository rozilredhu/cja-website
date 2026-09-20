import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Stamp pathname so root layout can apply maintenance mode (except /admin/*). */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-cja-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|js|css|map|webmanifest)$).*)",
  ],
};
