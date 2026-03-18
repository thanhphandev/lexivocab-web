"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, refreshSession } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasTriedRefresh = useRef(false);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !hasTriedRefresh.current) {
            hasTriedRefresh.current = true;
            // Try one silent refresh before redirecting
            refreshSession().then((ok) => {
                if (!ok) {
                    const locale = pathname.split("/")[1] || "en";
                    router.replace(`/${locale}/auth/login`);
                }
            });
        }
    }, [isAuthenticated, isLoading, refreshSession, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Show spinner while refresh attempt is in progress
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
