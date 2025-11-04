import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {}
export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|login|signup|not-found|global.css|public/).*)",
  ],
};
