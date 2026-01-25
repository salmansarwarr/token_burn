import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData } from "./lib/session";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Get session
    const session = await getIronSession<SessionData>(request, response, {
        password: process.env.SESSION_SECRET!,
        cookieName: "armchair_session",
    });

    const { pathname } = request.nextUrl;

    // Protect /dashboard routes - require wallet authentication
    if (pathname.startsWith("/dashboard")) {
        if (!session.address) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Protect /admin/dashboard routes - require admin authentication
    if (pathname.startsWith("/admin/dashboard")) {
        if (!session.adminId) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};
