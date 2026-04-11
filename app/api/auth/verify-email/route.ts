import { NextResponse } from "next/server";
import type { VerifyEmailRequest } from "@/lib/api/types";

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const body = (await request.json()) as VerifyEmailRequest;

    if (!email) {
        return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/v1/auth/verify-email?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return NextResponse.json({ 
            success: false, 
            error: data?.error || "Verification failed",
            errorCode: data?.errorCode
        }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
}
