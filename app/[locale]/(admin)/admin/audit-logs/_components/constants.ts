import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    CreditCard,
    Download,
    Globe,
    KeyRound,
    LogIn,
    LogOut,
    Pencil,
    RefreshCw,
    Settings,
    Shield,
    Trash2,
    Upload,
    UserCog,
    UserPlus,
    XCircle,
    Zap,
} from "lucide-react";
import React from "react";

export const AUDIT_ACTIONS = [
    "Login", "LoginFailed", "Register", "Logout", "TokenRefresh", "GoogleLogin",
    "VocabularyCreated", "VocabularyUpdated", "VocabularyDeleted", "VocabularyBulkImported", "VocabularyExported",
    "ReviewCompleted",
    "SettingsUpdated", "ProfileUpdated", "UserUpdated", "PasswordChanged", "UserDeleted",
    "SubscriptionCreated", "SubscriptionCancelled", "PaymentCompleted", "PaymentFailed",
    "AdminUserDeactivated", "AdminUserActivated", "AdminRoleChanged", "SystemSettingUpdated",
    "RateLimited", "SuspiciousActivity",
] as const;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export type ActionCategory = "auth" | "vocab" | "review" | "user" | "payment" | "admin" | "system";

export const ACTION_CONFIG: Record<string, { category: ActionCategory; icon: React.ElementType; color: string }> = {
    Login: { category: "auth", icon: LogIn, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    LoginFailed: { category: "auth", icon: XCircle, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
    Register: { category: "auth", icon: UserPlus, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    Logout: { category: "auth", icon: LogOut, color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20" },
    TokenRefresh: { category: "auth", icon: RefreshCw, color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
    GoogleLogin: { category: "auth", icon: Globe, color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    VocabularyCreated: { category: "vocab", icon: BookOpen, color: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20" },
    VocabularyUpdated: { category: "vocab", icon: Pencil, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    VocabularyDeleted: { category: "vocab", icon: Trash2, color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20" },
    VocabularyBulkImported: { category: "vocab", icon: Upload, color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
    VocabularyExported: { category: "vocab", icon: Download, color: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20" },
    ReviewCompleted: { category: "review", icon: CheckCircle2, color: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" },
    SettingsUpdated: { category: "user", icon: Settings, color: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20" },
    ProfileUpdated: { category: "user", icon: UserCog, color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20" },
    UserUpdated: { category: "user", icon: UserCog, color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20" },
    PasswordChanged: { category: "user", icon: KeyRound, color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
    UserDeleted: { category: "user", icon: Trash2, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
    SubscriptionCreated: { category: "payment", icon: CreditCard, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    SubscriptionCancelled: { category: "payment", icon: XCircle, color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    PaymentCompleted: { category: "payment", icon: CheckCircle2, color: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" },
    PaymentFailed: { category: "payment", icon: AlertTriangle, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
    AdminUserDeactivated: { category: "admin", icon: Shield, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
    AdminUserActivated: { category: "admin", icon: Shield, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    AdminRoleChanged: { category: "admin", icon: Shield, color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    SystemSettingUpdated: { category: "admin", icon: Settings, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    RateLimited: { category: "system", icon: Zap, color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
    SuspiciousActivity: { category: "system", icon: AlertTriangle, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20" },
};
