"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/lib/api/api-client";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ResetPasswordPage() {
    const t = useTranslations("Auth");
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const queryEmail = searchParams.get("email");
        if (queryEmail) {
            setEmail(queryEmail);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError(t("resetPasswordIncompleteCode"));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.resetPassword({ email, code, newPassword });
            if (res.success) {
                router.push(`/auth/login?reset=success`);
            } else {
                setError(res.error || t("unexpectedError"));
            }
        } catch {
            setError(t("unexpectedError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">{t("resetPasswordTitle")}</h1>
                <p className="text-sm text-muted-foreground">
                    {t("resetPasswordSubtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">{t("resetPasswordEmailLabel")}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="bg-muted text-muted-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label>{t("resetPasswordCodeLabel")}</Label>
                    <p className="text-xs text-muted-foreground mb-2">{t("resetPasswordCodeDesc")}</p>
                    <div className="flex justify-center py-2">
                        <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isLoading}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("resetPasswordNewLabel")}</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={6}
                    />
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                <Button className="w-full" type="submit" disabled={isLoading || code.length !== 6 || !newPassword}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("resetPasswordSubmit")}
                </Button>
            </form>

            <div className="text-center">
                <Button variant="link" asChild className="text-xs text-muted-foreground">
                    <Link href="/auth/login" className="flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        {t("backToLogin")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
