"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Brain,
    BarChart3,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Search,
} from "lucide-react";


interface NavItem {
    key: string;
    href: string;
    icon: React.ReactNode;
}

export function DashboardNav({ locale }: { locale: string }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const t = useTranslations("Dashboard");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            key: "home",
            href: `/${locale}/dashboard`,
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            key: "vocabulary",
            href: `/${locale}/dashboard/vocabulary`,
            icon: <BookOpen className="h-5 w-5" />,
        },
        {
            key: "review",
            href: `/${locale}/dashboard/review`,
            icon: <Brain className="h-5 w-5" />,
        },
        {
            key: "explore",
            href: `/${locale}/dashboard/explore`,
            icon: <Search className="h-5 w-5" />,
        },
        {
            key: "analytics",

            href: `/${locale}/dashboard/analytics`,
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            key: "billing",
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className="h-5 w-5" />,
        },
        {
            key: "settings",
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className="h-5 w-5" />,
        },
    ];

    const isActive = (href: string) => {
        if (href === `/${locale}/dashboard`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const initials = user?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-3 px-4 py-5 border-b border-border/50 group relative overflow-hidden flex-shrink-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-500">
                {/* Subtle background glow */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                />

                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0, x: -10 }}
                            animate={{ opacity: 1, width: "auto", x: 0 }}
                            exit={{ opacity: 0, width: 0, x: -10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="overflow-hidden flex flex-col justify-center"
                        >
                            <motion.h1
                                className="text-[22px] font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] pb-0.5"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                LexiVocab.
                            </motion.h1>
                            <div className="flex items-center gap-1.5 group/subtitle mt-0.5">
                                <motion.div
                                    className="h-[2px] w-2 bg-gradient-to-r from-primary to-orange-500 rounded-full group-hover/subtitle:w-5 transition-all duration-300"
                                />
                                <p className="text-[10px] font-bold text-muted-foreground/70 tracking-[0.2em] uppercase transition-colors group-hover:text-primary/90">
                                    {t("subtitle")}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 group relative ${active
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:pl-4"
                                }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={cn("shrink-0 transition-all duration-300", active ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110 group-hover:-rotate-3")}>
                                {item.icon}
                            </span>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="overflow-hidden whitespace-nowrap"
                                    >
                                        {t(`nav.${item.key}`)}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle (Desktop) */}
            <div className="hidden lg:block px-3 pb-2">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300 group"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", collapsed ? "rotate-180" : "group-hover:-translate-x-1")} />
                    {!collapsed && <span>{t("nav.collapse")}</span>}
                </button>
            </div>

            {/* User Footer */}
            <div className="border-t border-border/50 px-3 py-4 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-orange-500 text-white font-bold text-xs overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.05]">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 min-w-0 overflow-hidden"
                            >
                                <p className="text-sm font-bold truncate text-foreground leading-tight">{user?.fullName}</p>
                                <p className="text-[10px] font-medium text-muted-foreground truncate">{user?.email}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 hover:rotate-12 hover:scale-110 origin-center group"
                            title={t("nav.logout")}
                        >
                            <LogOut className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:bg-accent hover:text-accent-foreground transition-all active:scale-95 duration-200"
            >
                <Menu className="h-5 w-5 text-foreground" />
            </button>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 z-50 h-screen w-[280px] bg-card border-r border-border shadow-2xl lg:hidden"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="hidden lg:flex h-screen sticky top-0 flex-col bg-card border-r border-border shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30"
            >
                {sidebarContent}
            </motion.aside>
        </>
    );
}
