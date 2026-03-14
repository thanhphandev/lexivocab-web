"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Settings, LogOut, ShieldAlert, ClipboardList } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

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
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/40 pb-4 pt-6">
            <div className="px-6 mb-8 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">LexiAdmin</h1>
            </div>

            <div className="flex-1 px-4 py-2 space-y-1">
                {routes.map((route) => {
                    const isActive = pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href));
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                                isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <route.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {route.label}
                        </Link>
                    );
                })}
            </div>

            <div className="px-4 mt-auto">
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
