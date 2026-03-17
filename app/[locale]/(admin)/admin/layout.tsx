"use client";

import { AuthGuard } from "@/components/dashboard/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (user?.role === "Admin") {
                setIsAdmin(true);
            } else if (user) {
                // Logged in but not admin -> redirect back to user dashboard
                router.replace("/dashboard");
            }
        }
    }, [user, isLoading, router]);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <AdminSidebar />
                </div>
                
                {/* Main Content Pane */}
                <div className="flex flex-col flex-1 overflow-hidden relative bg-muted/10">
                    <AdminHeader />
                    
                    <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
