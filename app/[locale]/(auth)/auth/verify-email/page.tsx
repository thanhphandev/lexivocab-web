"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/lib/api/api-client";
import { getLocalizedApiError } from "@/lib/error-handler";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
    const t = useTranslations("Auth");
    const tErrors = useTranslations("errors");
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const queryEmail = searchParams.get("email");
        if (queryEmail) {
            setEmail(queryEmail);
        } else {
            router.push("/auth/login");
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError(t("verifyEmailIncompleteCode"));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.verifyEmail(email, { code });
            if (res.success) {
                router.push(`/auth/login?verified=true`);
            } else {
                setError(getLocalizedApiError(res, tErrors, t("verifyEmailFailed")));
            }
        } catch {
            setError(t("unexpectedError"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await authApi.resendVerificationEmail({ email });
            if (res.success) {
                setSuccessMessage(t("verifyEmailResendSuccess"));
            } else {
                setError(getLocalizedApiError(res, tErrors, t("verifyEmailResendFailed")));
            }
        } catch {
            setError(t("unexpectedError"));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2"
            >
                <MailCheck className="w-8 h-8" />
            </motion.div>

            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmailTitle")}</h1>
                <p className="text-sm text-muted-foreground">
                    {t("verifyEmailDesc", { email })}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center py-4">
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

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                {successMessage && <p className="text-sm font-medium text-green-600">{successMessage}</p>}

                <Button className="w-full" type="submit" disabled={isLoading || code.length !== 6}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("verifyEmailSubmit")}
                </Button>
            </form>

            <div className="pt-4 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                    {t("verifyEmailDidntReceive")}
                </p>
                <Button variant="outline" className="w-full" onClick={handleResend} disabled={isResending}>
                    {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("verifyEmailResend")}
                </Button>
            </div>

            <div className="text-center pt-2">
                <Button variant="link" asChild className="text-xs text-muted-foreground">
                    <Link href="/auth/login" className="flex items-center gap-2 justify-center">
                        <ArrowLeft className="w-3 h-3" />
                        {t("backToLogin")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
