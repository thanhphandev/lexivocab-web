import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const { userId } = body;
    
    if (!userId) {
        return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const targetUrl = `${API_URL}/api/v1/admin/users/${userId}/impersonate`;

    const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return NextResponse.json({ success: false, error: data?.error || data?.title || "Impersonation failed" }, { status: res.status });
    }

    const payload = data.data || data;
    const { accessToken, expiresAt } = payload;
    const expiresDate = new Date(expiresAt);

    // Set the new impersonation token
    cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresDate,
    });

    // Clear the refresh token to force re-authentication after the 15m impersonation expires
    cookieStore.delete("refresh_token");

    return NextResponse.json({
        success: true,
        data: payload
    });
}
