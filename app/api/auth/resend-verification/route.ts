import { NextResponse } from "next/server";
import type { ForgotPasswordRequest } from "@/lib/api/types";

export async function POST(request: Request) {
    const body = (await request.json()) as ForgotPasswordRequest;

    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/v1/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return NextResponse.json({ 
            success: false, 
            error: data?.error || "Failed to resend email",
            errorCode: data?.errorCode
        }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
}
