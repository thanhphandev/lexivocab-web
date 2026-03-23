"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/api-client";
import { getLocalizedApiError } from "@/lib/error-handler";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getResetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { AuthLogo } from "@/components/auth/auth-logo";

export default function ResetPasswordPage() {
    const t = useTranslations("Auth");
    const tErrors = useTranslations("errors");
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const schema = getResetPasswordSchema(t);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: "",
        },
    });

    useEffect(() => {
        const queryEmail = searchParams.get("email");
        if (queryEmail) {
            setEmail(queryEmail);
        }
    }, [searchParams]);

    const onSubmit = async (data: ResetPasswordInput) => {
        if (code.length !== 6) {
            setError(t("resetPasswordIncompleteCode"));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.resetPassword({ email, code, newPassword: data.password });
            if (res.success) {
                router.push(`/${locale}/auth/login?reset=success`);
            } else {
                setError(getLocalizedApiError(res, tErrors, t("unexpectedError")));
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
                <div className="mb-6">
                    <AuthLogo />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("resetPasswordTitle")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("resetPasswordSubtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <Label htmlFor="password">{t("resetPasswordNewLabel")}</Label>
                    <Input
                        {...register("password")}
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="border-border py-3 focus:ring-primary"
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    className="w-full h-11 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                    type="submit"
                    disabled={isLoading || code.length !== 6}
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