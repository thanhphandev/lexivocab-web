"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
    const locale = useLocale();
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
                router.push(`/${locale}/auth/login?reset=success`);
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
            <div className="text-center">
                <div className="flex items-center gap-3 mb-6">
                    {/* Logo Container */}
                    <div className="flex h-12 w-12 items-center justify-center">
                        <Image src="/apple-icon.png" alt="Logo" width={32} height={32} />
                    </div>

                    {/* Branding Text */}
                    <div className="flex items-baseline">
                        <span className="text-2xl font-bold tracking-tight text-gray-900">
                            LexiVocab<span className="text-orange-600">.</span>
                        </span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("resetPasswordTitle")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("resetPasswordSubtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        {t("resetPasswordEmailLabel")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="bg-muted text-muted-foreground cursor-not-allowed border-border py-3"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("resetPasswordCodeLabel")}</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                        {t("resetPasswordCodeDesc")}
                    </p>
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
                        className="border-border py-3 focus:ring-primary"
                    />
                </div>

                <Button
                    className="w-full h-11 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                    type="submit"
                    disabled={isLoading || code.length !== 6 || !newPassword}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("resetPasswordSubmit")}
                </Button>
            </form>

            <div className="text-center pt-2">
                <Button variant="link" asChild className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Link href={`/${locale}/auth/login`} className="flex items-center justify-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        {t("backToLogin")}
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}