// src/proxy.ts (hoặc proxy.ts)
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale
});

export const config = {
    // Matcher này sẽ BỎ QUA các folder: api, _next, _vercel và các file có đuôi (như .png, .css...)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};