"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

interface SocialLoginProps {
    action: "login" | "register";
}

export function SocialLogin({ action }: SocialLoginProps) {
    const { googleLogin } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const t = useTranslations("Auth");
    const [googleLoading, setGoogleLoading] = useState(false);

    const getSafeRedirectUrl = (url: string | null, fallback: string) => {
        if (!url) return fallback;
        if (url.startsWith('/') && !url.startsWith('//')) return url;
        return fallback;
    };

    const handleGoogleResponse = useCallback(async (credential: string) => {
        setGoogleLoading(true);
        const result = await googleLogin(credential);
        setGoogleLoading(false);
        if (result.success) {
            router.push(getSafeRedirectUrl(searchParams.get("redirect"), `/${locale}/dashboard`));
        }
    }, [googleLogin, router, locale, searchParams]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-full justify-center">
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if (credentialResponse.credential) {
                            handleGoogleResponse(credentialResponse.credential);
                        }
                    }}
                    onError={() => {
                        console.error(`Google ${action === "login" ? "Login" : "Sign Up"} Failed`);
                    }}
                    theme="outline"
                    size="large"
                    text={action === "login" ? "continue_with" : "signup_with"}
                    shape="pill"
                    width="280"
                />
            </div>
            {googleLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {action === "login" ? t("signingInWithGoogle") : t("signingUpWithGoogle")}
                </div>
            )}
        </div>
    );
}
