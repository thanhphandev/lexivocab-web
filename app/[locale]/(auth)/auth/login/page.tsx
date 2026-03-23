"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getLoginSchema, type LoginInput } from "@/lib/validations/auth";
import { AuthLogo } from "@/components/auth/auth-logo";
import { SocialLogin } from "@/components/auth/social-login";

export default function LoginPage() {
    const { login, isLoading, error, errorCode, clearError, isAuthenticated } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Auth");
    const searchParams = useSearchParams();

    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");

    const schema = getLoginSchema(t);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const emailWatcher = watch("email");

    const getSafeRedirectUrl = (url: string | null, fallback: string) => {
        if (!url) return fallback;
        if (url.startsWith('/') && !url.startsWith('//')) return url;
        return fallback;
    };

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(getSafeRedirectUrl(searchParams.get("redirect"), `/${locale}/dashboard`));
        }
    }, [isAuthenticated, router, locale, searchParams]);

    const onSubmit = async (data: LoginInput) => {
        if (error) clearError();
        const success = await login(data);
        if (success) {
            router.push(getSafeRedirectUrl(searchParams.get("redirect"), `/${locale}/dashboard`));
        }
    };

    if (isAuthenticated) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
            <div className="text-center">
                <AuthLogo />
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                    {t("loginTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("loginSubtitle")}
                </p>
            </div>

            <SocialLogin action="login" />

            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground uppercase font-medium">{t("orDivider")}</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {(verified || reset) && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>
                            {verified === "true" && t("emailVerifiedSuccess")}
                            {reset === "success" && t("passwordResetSuccess")}
                        </p>
                    </motion.div>
                )}

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

                <div className="space-y-4 rounded-md">
                    <div>
                        <label className="sr-only" htmlFor="email-address">
                            {t("email")}
                        </label>
                        <input
                            {...register("email")}
                            id="email-address"
                            type="email"
                            autoComplete="email"
                            className="relative block w-full rounded-t-lg border border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                            placeholder={t("emailPlaceholder")}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="password">
                            {t("password")}
                        </label>
                        <input
                            {...register("password")}
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="relative block w-full rounded-b-lg border border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                            placeholder={t("passwordPlaceholder")}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <Link href={`/${locale}/auth/forgot-password`} className="font-medium text-primary hover:text-primary/90">
                            {t("forgotPassword")}
                        </Link>
                    </div>
                </div>

                {errorCode === "AUTH_EMAIL_NOT_VERIFIED" && (
                    <div className="flex justify-center mt-2">
                        <Link href={`/${locale}/auth/verify-email?email=${encodeURIComponent(emailWatcher || "")}`} className="text-sm font-medium text-primary underline">
                            {t("verifyEmailLink")}
                        </Link>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            t("loginButton")
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    {t("noAccount")}{" "}
                    <Link
                        href={`/${locale}/auth/register${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect") as string)}` : ""}`}
                        className="font-medium text-primary hover:text-primary/90 transition-colors"
                    >
                        {t("registerLink")}
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
