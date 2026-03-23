"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/lib/api/api-client";
import { getLocalizedApiError } from "@/lib/error-handler";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getForgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { AuthLogo } from "@/components/auth/auth-logo";

export default function ForgotPasswordPage() {
    const t = useTranslations("Auth");
    const tErrors = useTranslations("errors");
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const schema = getForgotPasswordSchema(t);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
        },
    });

    const emailWatcher = watch("email");

    const onSubmit = async (data: ForgotPasswordInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.forgotPassword(data);
            if (res.success) {
                setIsSuccess(true);
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
            <div className="mb-6">
                <AuthLogo />
            </div>

            <AnimatePresence mode="wait">
                {isSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-inner">
                            <MailCheck className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t("forgotPasswordCheckTitle")}
                            </h1>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                {t("forgotPasswordCheckDesc", { email: emailWatcher })}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full pt-2">
                            <Button asChild className="w-full h-11 shadow-md hover:shadow-lg transition-all">
                                <Link href={`/${locale}/auth/reset-password?email=${encodeURIComponent(emailWatcher)}`}>
                                    {t("forgotPasswordEnterCode")}
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground"
                                onClick={() => setIsSuccess(false)}
                            >
                                {t("forgotPasswordTryAgain")}
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {t("forgotPasswordTitle")}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t("forgotPasswordSubtitle")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/15 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    {t("forgotPasswordEmailLabel")}
                                </Label>
                                <Input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                    className="border-border py-6 focus:ring-primary"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <Button
                                className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("forgotPasswordSubmit")}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button variant="link" asChild className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                <Link href={`/${locale}/auth/login`} className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-3 h-3" />
                                    {t("backToLogin")}
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}