import { AuthGuard } from "@/components/dashboard/auth-guard";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

import { Toaster } from "sonner";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
    children,
    params,
}: DashboardLayoutProps) {
    const { locale } = await params;

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Toaster richColors position="top-right" closeButton />
            <DashboardNav locale={locale} />
            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="container mx-auto py-6 px-4 md:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
