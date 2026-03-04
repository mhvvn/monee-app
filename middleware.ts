import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        }
    );

    const isAuthRoute =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register");

    // Jika mencoba ke rute proteksi (mis. /dashboard) tapi belum login
    if (!session && !isAuthRoute && request.nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Jika sudah login tapi mencoba ke halaman login/register
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
