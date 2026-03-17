"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/lib/api/api-client";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const t = useTranslations("Auth");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.forgotPassword({ email });
            if (res.success) {
                setIsSuccess(true);
            } else {
                setError(res.error || "Failed to send reset link");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4"
                >
                    <MailCheck className="w-8 h-8" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                    <p className="text-muted-foreground text-sm max-w-sm">
                        If an account exists for <span className="font-semibold text-foreground">{email}</span>, we have sent a 6-digit reset code.
                    </p>
                </div>
                <div className="pt-4 flex flex-col gap-2 w-full">
                    <Button asChild className="w-full">
                        <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
                            Enter Reset Code
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setIsSuccess(false)}>
                        Didn't receive it? Try again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <Button className="w-full" type="submit" disabled={isLoading || !email}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send reset instructions
                </Button>
            </form>

            <div className="text-center">
                <Button variant="link" asChild className="text-xs text-muted-foreground">
                    <Link href="/auth/login" className="flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        Back to log in
                    </Link>
                </Button>
            </div>
        </div>
    );
}
