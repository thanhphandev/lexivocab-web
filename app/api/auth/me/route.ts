import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/api-client";
import type { UserProfile } from "@/lib/api/types";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, error: "Not authenticated" },
            { status: 401 }
        );
    }

    const result = await serverFetch<UserProfile>("/api/v1/auth/me", {
        method: "GET",
    }, token);

    if (!result.success) {
        return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
}
