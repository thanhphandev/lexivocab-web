/**
 * Catch-all API proxy route — forwards authenticated requests to backend API.
 * 
 * Security features:
 * - Path whitelist: only allows known API prefixes
 * - Auto token refresh: intercepts 401, refreshes tokens, retries the request
 * - Body size limit: caps request body at 1MB
 * - Proper response forwarding: preserves Content-Type for file exports
 *
 * Client calls: /api/proxy/vocabularies?page=1
 * This proxy calls: http://localhost:5000/api/vocabularies?page=1
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Only allow proxying to these known API path prefixes
const ALLOWED_PREFIXES = [
    "vocabularies",
    "reviews",
    "analytics",
    "settings",
    "master-vocab",
    "payments",
    "auth",
    "admin",
    "tags",
    "ai",
    "diagnostics"
];


const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

function isPathAllowed(path: string): boolean {
    const firstSegment = path.split("/")[0]?.toLowerCase();
    return ALLOWED_PREFIXES.includes(firstSegment);
}

async function tryRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const accessToken = cookieStore.get("access_token")?.value;

    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `refreshToken=${refreshToken}`,
                ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ accessToken }),
        });

        if (!res.ok) return null;

        const data = await res.json().catch(() => null);
        if (!data?.success) return null;

        const payload = data.data || data;
        const { accessToken: newAccessToken, expiresAt } = payload;

        const setCookieHeader = res.headers.get("Set-Cookie");
        let newRefreshToken = "";
        if (setCookieHeader) {
            const match = setCookieHeader.match(/refreshToken=([^;]+)/);
            if (match) newRefreshToken = match[1];
        }
        const expiresDate = new Date(expiresAt);

        cookieStore.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: expiresDate,
        });

        // Only update refresh_token cookie if backend issued a new one
        if (newRefreshToken) {
            cookieStore.set("refresh_token", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            });
        }

        return newAccessToken;
    } catch {
        return null;
    }
}

async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
}

async function makeApiRequest(
    targetUrl: string,
    method: string,
    headers: Record<string, string>,
    body: string | null,
): Promise<Response> {
    const fetchOptions: RequestInit = {
        method,
        headers,
        cache: "no-store",
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        fetchOptions.body = body;
    }

    return fetch(targetUrl, fetchOptions);
}

async function proxyRequest(request: NextRequest, params: Promise<{ path: string[] }>) {
    const { path } = await params;
    const apiPath = path.join("/");

    // ─── Security: path whitelist ──────────────────────────────
    if (!isPathAllowed(apiPath)) {
        return NextResponse.json(
            { success: false, error: "Forbidden: invalid API path" },
            { status: 403 }
        );
    }

    // ─── Security: body size limit ─────────────────────────────
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
        return NextResponse.json(
            { success: false, error: "Request body too large (max 1MB)" },
            { status: 413 }
        );
    }

    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;

    // ─── Auto refresh if no access token ────────────────────
    if (!token) {
        const refreshedToken = await tryRefreshToken();
        if (refreshedToken) {
            token = refreshedToken;
        }
    }

    const url = new URL(request.url);
    const queryString = url.search;
    const targetUrl = `${API_URL}/api/v1/${apiPath}${queryString}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Read body once for potential retry
    let body: string | null = null;
    if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
        body = await request.text();
    }

    try {
        let res = await makeApiRequest(targetUrl, request.method, headers, body);

        // ─── Auto token refresh on 401 ─────────────────────────
        if (res.status === 401) {
            const newToken = await tryRefreshToken();
            if (newToken) {
                headers["Authorization"] = `Bearer ${newToken}`;
                res = await makeApiRequest(targetUrl, request.method, headers, body);
            } else {
                // Refresh failed — clear stale cookies so client is forced to re-login
                await clearAuthCookies();
                return NextResponse.json(
                    { success: false, error: "Session expired. Please log in again." },
                    { status: 401 }
                );
            }
        }

        const responseContentType = res.headers.get("content-type") || "";

        // ─── Handle Streaming Responses (SSE) ─────────────────
        if (responseContentType.includes("text/event-stream")) {
            return new NextResponse(res.body, {
                status: res.status,
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        }

        // ─── Handle file exports (binary responses) ────────────
        if (
            responseContentType.includes("application/octet-stream") ||
            responseContentType.includes("text/csv") ||
            res.headers.get("content-disposition")
        ) {
            const buffer = await res.arrayBuffer();
            const responseHeaders = new Headers();
            responseHeaders.set("Content-Type", responseContentType);
            const contentDisposition = res.headers.get("content-disposition");
            if (contentDisposition) {
                responseHeaders.set("Content-Disposition", contentDisposition);
            }
            return new NextResponse(buffer, {
                status: res.status,
                headers: responseHeaders,
            });
        }

        // ─── Standard JSON responses ───────────────────────────
        if (res.status === 204) {
            return NextResponse.json({ success: true, data: null });
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data ?? { success: false, error: "Invalid response" }, {
            status: res.status,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err instanceof Error ? err.message : "Proxy error" },
            { status: 502 }
        );
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, params);
}
