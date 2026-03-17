/**
 * Server-side refresh token endpoint.
 * Reads refresh_token from HttpOnly cookie, calls API to get new tokens,
 * then updates cookies. Used by the proxy route for automatic 401 recovery.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/api-client";
import type { AuthResponse } from "@/lib/api/types";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const accessToken = cookieStore.get("access_token")?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { success: false, error: "No refresh token" },
            { status: 401 }
        );
    }

    // Call the API refresh endpoint — needs the old access token for user ID extraction and old refresh token in Cookie
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": `refreshToken=${refreshToken}`,
            ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ accessToken }), // Access token might still be required by .NET DTO
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // Refresh failed — clear cookies to force re-login
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        return NextResponse.json({ success: false, error: data?.error || "Refresh failed" }, { status: 401 });
    }

    const { accessToken: newAccessToken, expiresAt } = data.data || data;
    const expiresDate = new Date(expiresAt);

    const setCookieHeader = res.headers.get("Set-Cookie");
    let newRefreshToken = "";
    let refreshTokenExpires: Date | undefined;
    if (setCookieHeader) {
        const tokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
        if (tokenMatch) newRefreshToken = tokenMatch[1];

        const expiresMatch = setCookieHeader.match(/expires=([^;]+)/i);
        if (expiresMatch) refreshTokenExpires = new Date(expiresMatch[1]);
    }

    cookieStore.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresDate,
    });

    if (newRefreshToken) {
        cookieStore.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            ...(refreshTokenExpires ? { expires: refreshTokenExpires } : { maxAge: 60 * 60 * 24 * 30 }),
        });
    }


    return NextResponse.json({ success: true, data: { accessToken: newAccessToken } });
}
