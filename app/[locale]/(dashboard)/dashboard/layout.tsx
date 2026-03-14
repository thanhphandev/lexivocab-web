import { AuthGuard } from "@/components/dashboard/auth-guard";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

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
        <AuthGuard>
            <div className="flex min-h-screen bg-background">
                <DashboardNav locale={locale} />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
