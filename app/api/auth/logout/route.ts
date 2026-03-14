import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
        const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${API_URL}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
                "Cookie": `refreshToken=${refreshToken}`
            }
        }).catch(() => null); // Ignore errors on logout
    }

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({ success: true });
}
