import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/api-client";
import type { AuthResponse, LoginRequest } from "@/lib/api/types";

export async function POST(request: Request) {
    const body = (await request.json()) as LoginRequest;

    // Call the .NET API directly so we can inspect headers
    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return NextResponse.json({ success: false, error: data?.error || "Login failed" }, { status: 401 });
    }

    const { accessToken, expiresAt, userId, email, fullName, role } = data.data || data;
    const expiresDate = new Date(expiresAt);

    // Extract refreshToken and its expiration from the Set-Cookie header returned by .NET
    const setCookieHeader = res.headers.get("Set-Cookie");
    let refreshToken = "";
    let refreshTokenExpires: Date | undefined;
    if (setCookieHeader) {
        const tokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
        if (tokenMatch) refreshToken = tokenMatch[1];

        const expiresMatch = setCookieHeader.match(/expires=([^;]+)/i);
        if (expiresMatch) refreshTokenExpires = new Date(expiresMatch[1]);
    }

    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresDate,
    });

    if (refreshToken) {
        cookieStore.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            ...(refreshTokenExpires ? { expires: refreshTokenExpires } : { maxAge: 60 * 60 * 24 * 7 }),
        });
    }

    // Return user data (without tokens) to client
    return NextResponse.json({
        success: true,
        data: {
            id: userId,
            email,
            fullName,
            role,
        },
    });
}
