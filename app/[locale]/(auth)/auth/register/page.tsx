"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const { register, googleLogin, isLoading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Auth");
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(`/${locale}/dashboard`);
        }
    }, [isAuthenticated, router, locale]);

    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await register({ email, password, fullName });
        if (success) {
            router.push(`/${locale}/dashboard`);
        }
    };

    const handleGoogleResponse = useCallback(async (credential: string) => {
        setGoogleLoading(true);
        const success = await googleLogin(credential);
        setGoogleLoading(false);
        if (success) {
            router.push(`/${locale}/dashboard`);
        }
    }, [googleLogin, router, locale]);


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-md">
                    <span className="text-xl font-bold">L</span>
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                    {t("registerTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("registerSubtitle")}
                </p>
            </div>

            {/* Google Sign-In */}
            <div className="mt-8 flex flex-col items-center gap-4">
                <div className="w-full flex justify-center h-12">
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            if (credentialResponse.credential) {
                                handleGoogleResponse(credentialResponse.credential);
                            }
                        }}
                        onError={() => {
                            console.error('Google Sign Up Failed');
                        }}
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="pill"
                        width="280"
                    />
                </div>
                {googleLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing up with Google...
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground uppercase font-medium">or</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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

                <div className="space-y-4 rounded-md shadow-sm">
                    <div>
                        <label className="sr-only" htmlFor="fullName">
                            {t("fullName")}
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            required
                            className="relative block w-full rounded-t-lg border border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                            placeholder={t("fullNamePlaceholder")}
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                if (error) clearError();
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="email-address">
                            {t("email")}
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full border-x border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                            placeholder={t("emailPlaceholder")}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) clearError();
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="password">
                            {t("password")}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="relative block w-full rounded-b-lg border border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                            placeholder={t("passwordPlaceholder")}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) clearError();
                            }}
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            t("registerButton")
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    {t("hasAccount")}{" "}
                    <Link
                        href={`/${locale}/auth/login`}
                        className="font-medium text-primary hover:text-primary/90 transition-colors"
                    >
                        {t("loginLink")}
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
