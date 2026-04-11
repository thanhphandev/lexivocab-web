"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations("ErrorPages.error");

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-6"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                >
                    <Image
                        src="/illustrations/error.png"
                        alt="Error occurred"
                        width={220}
                        height={220}
                        className="mx-auto opacity-90 dark:opacity-80"
                        priority
                    />
                </motion.div>

                <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        {t("description")}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground/50 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                        onClick={reset}
                        className="rounded-xl h-12 px-6 font-semibold shadow-lg shadow-primary/25"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("tryAgain")}
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl h-12 px-6 font-semibold"
                        asChild
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            {t("backHome")}
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
