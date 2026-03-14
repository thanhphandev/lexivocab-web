"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, googleLogin, isLoading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Auth");
    const [googleLoading, setGoogleLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace(`/${locale}/dashboard`);
        }
    }, [isAuthenticated, router, locale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login({ email, password });
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


    if (isAuthenticated) {
        return null;
    }

    return (
        <>
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
                        {t("loginTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t("loginSubtitle")}
                    </p>
                </div>

                {/* Google Sign-In */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full flex justify-center h-12">
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                if (credentialResponse.credential) {
                                    handleGoogleResponse(credentialResponse.credential);
                                }
                            }}
                            onError={() => {
                                console.error('Google Login Failed');
                            }}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="pill"
                            width="280"
                        />
                    </div>
                    {googleLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Signing in with Google...
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground uppercase font-medium">or</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                            <label className="sr-only" htmlFor="email-address">
                                {t("email")}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-lg border-x border-t border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
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
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-lg border border-border bg-transparent px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                                placeholder={t("passwordPlaceholder")}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) clearError();
                                }}
                                disabled={isLoading}
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
                                t("loginButton")
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("noAccount")}{" "}
                        <Link
                            href={`/${locale}/auth/register`}
                            className="font-medium text-primary hover:text-primary/90 transition-colors"
                        >
                            {t("registerLink")}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </>
    );
}
