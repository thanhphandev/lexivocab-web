import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
});

const PUBLIC_FILE = /\.(.*)$/;

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static files, Next.js internals, and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        PUBLIC_FILE.test(pathname) ||
        pathname === "/health" ||
        pathname === "/favicon.ico"
    ) {
        return intlMiddleware(request);
    }

    const token = request.cookies.get("access_token")?.value;

    // Extract locale from pathname (e.g., /en/dashboard → en)
    const segments = pathname.split("/").filter(Boolean);
    const locale = segments[0] || defaultLocale;

    // Protected routes — require authentication
    if (pathname.includes("/dashboard") || pathname.includes("/admin")) {
        if (!token) {
            const loginUrl = new URL(`/${locale}/auth/login`, request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
        return intlMiddleware(request);
    }

    // Auth routes — redirect to dashboard if already authenticated
    if (pathname.includes("/auth/login") || pathname.includes("/auth/register")) {
        if (token) {
            return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
        }
        return intlMiddleware(request);
    }

    return intlMiddleware(request);
}

export const config = {
    // Match all paths except static files, API routes, and Next.js internals
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)',]
};