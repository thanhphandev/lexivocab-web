import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
    const t = useTranslations("ErrorPages.notFound");

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
                    <div className="max-w-md w-full text-center space-y-6">
                        <Image
                            src="/illustrations/not-found.png"
                            alt="Page not found"
                            width={240}
                            height={240}
                            className="mx-auto opacity-90"
                            priority
                        />

                        <div className="space-y-3">
                            <p className="text-7xl font-black text-primary/20 select-none">404</p>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                {t("title")}
                            </h1>
                            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                                {t("description")}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-xl"
                            >
                                {t("backHome")}
                            </Link>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                            >
                                {t("backDashboard")}
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
