"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, LogOut, ShieldAlert, ClipboardList, BookOpen, Key, Box, Activity, Ticket } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLocale } from "next-intl";

const routes = [
    {
        label: "Overview",
        icon: BarChart3,
        href: "/admin",
    },
    {
        label: "Users",
        icon: Users,
        href: "/admin/users",
    },
    {
        label: "Audit Logs",
        icon: ClipboardList,
        href: "/admin/audit-logs",
    },
    {
        label: "Vocabularies",
        icon: BookOpen,
        href: "/admin/vocabularies",
    },
    {
        label: "Features",
        icon: Key,
        href: "/admin/features",
    },
    {
        label: "Coupons",
        icon: Ticket,
        href: "/admin/coupons",
    },
    {
        label: "SaaS Plans",
        icon: Box,
        href: "/admin/plans",
    },
    {
        label: "Diagnostics",
        icon: Activity,
        href: "/admin/diagnostics",
    },
];

interface AdminSidebarProps {
    className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname();
    const locale = useLocale();
    const { logout } = useAuth();

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-muted/20 pb-4 pt-6", className)}>
            <div className="px-6 mb-8 flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">LexiAdmin</h1>
            </div>

            <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {routes.map((route) => {
                    const fullHref = `/${locale}${route.href}`;
                    const isActive = pathname === fullHref || (route.href !== "/admin" && pathname.startsWith(fullHref));
                    return (
                        <Link
                            key={route.href}
                            href={fullHref}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <route.icon className={cn("h-4 w-4")} />
                            {route.label}
                        </Link>
                    );
                })}
            </div>

            <div className="px-4 mt-auto pt-4 border-t">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
