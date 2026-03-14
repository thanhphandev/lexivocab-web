import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/api-client";
import type { AuthResponse, RegisterRequest } from "@/lib/api/types";

export async function POST(request: Request) {
    const body = (await request.json()) as RegisterRequest;

    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return NextResponse.json({ success: false, error: data?.error || "Registration failed" }, { status: 400 });
    }

    const { accessToken, expiresAt, userId, email, fullName, role } = data.data || data;
    const expiresDate = new Date(expiresAt);

    const setCookieHeader = res.headers.get("Set-Cookie");
    let refreshToken = "";
    if (setCookieHeader) {
        const match = setCookieHeader.match(/refreshToken=([^;]+)/);
        if (match) refreshToken = match[1];
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
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });
    }

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
