"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
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
import { AuthLogo } from "@/components/auth/auth-logo";

export default function VerifyEmailPage() {
    const t = useTranslations("Auth");
    const tErrors = useTranslations("errors");
    const router = useRouter();
    const locale = useLocale();
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
            router.push(`/${locale}/auth/login`);
        }
    }, [searchParams, router, locale]);

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
                router.push(`/${locale}/auth/login?verified=true`);
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
            <div className="text-center">
                <div className="mb-6">
                    <AuthLogo />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner"
                >
                    <MailCheck className="w-8 h-8" />
                </motion.div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("verifyEmailTitle")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("verifyEmailDesc", { email })}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/15 p-3 text-sm text-destructive"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/15 p-3 text-sm text-primary"
                    >
                        <MailCheck className="h-4 w-4 shrink-0" />
                        <p>{successMessage}</p>
                    </motion.div>
                )}

                <Button className="w-full h-11 text-sm font-semibold transition-all shadow-md hover:shadow-lg" type="submit" disabled={isLoading || code.length !== 6}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("verifyEmailSubmit")}
                </Button>
            </form>

            <div className="pt-2 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground text-center">
                    {t("verifyEmailDidntReceive")}
                </p>
                <Button variant="outline" className="w-full h-11" onClick={handleResend} disabled={isResending}>
                    {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("verifyEmailResend")}
                </Button>
            </div>

            <div className="text-center pt-2">
                <Button variant="link" asChild className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Link href={`/${locale}/auth/login`} className="flex items-center gap-2 justify-center">
                        <ArrowLeft className="w-3 h-3" />
                        {t("backToLogin")}
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}
