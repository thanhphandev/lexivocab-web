"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, languageNames } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2, Palette, ShieldAlert, Target, Code, Globe, Lock, KeyRound, Sparkles, BellRing, Mail, MessageCircle, Send } from "lucide-react";
import { authApi, settingsApi } from "@/lib/api/api-client";
import { toast } from "sonner";
import { showErrorToast, getErrorMessage } from "@/lib/error-handler";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CustomLlmManager } from "./custom-llm-manager";
import { QuickModelSwitcher } from "@/components/ai/quick-model-switcher";

const SUPPORTED_LANGUAGES = [
    { value: "auto", label: "Auto Detect 🌐" },
    { value: "en", label: "English 🇺🇸" },
    { value: "vi", label: "Tiếng Việt 🇻🇳" },
    { value: "es", label: "Español 🇪🇸" },
    { value: "fr", label: "Français 🇫🇷" },
    { value: "ja", label: "日本語 🇯🇵" },
    { value: "ko", label: "한국어 🇰🇷" },
    { value: "zh", label: "中文 (Simplified) 🇨🇳" },
    { value: "zh-Hant", label: "中文 (Traditional) 🇹🇼" },
    { value: "de", label: "Deutsch 🇩🇪" },
    { value: "it", label: "Italiano 🇮🇹" },
    { value: "ru", label: "Russian 🇷🇺" },
    { value: "pt", label: "Portuguese 🇵🇹" },
    { value: "ar", label: "العربية 🇸🇦" },
    { value: "hi", label: "हिन्दी 🇮🇳" },
    { value: "id", label: "Bahasa Indonesia 🇮🇩" },
    { value: "th", label: "ไทย 🇹🇭" },
    { value: "tr", label: "Türkçe 🇹🇷" },
    { value: "nl", label: "Nederlands 🇳🇱" },
    { value: "pl", label: "Polski 🇵🇱" },
    { value: "sv", label: "Svenska 🇸🇪" },
    { value: "da", label: "Dansk 🇩🇰" },
    { value: "no", label: "Norsk 🇳🇴" },
    { value: "fi", label: "Suomi 🇫🇮" },
    { value: "el", label: "Ελληνικά 🇬🇷" },
    { value: "cs", label: "Čeština 🇨🇿" },
    { value: "hu", label: "Magyar 🇭🇺" },
    { value: "ro", label: "Română 🇷🇴" },
    { value: "uk", label: "Українська 🇺🇦" },
    { value: "ms", label: "Bahasa Melayu 🇲🇾" },
    { value: "tl", label: "Filipino 🇵🇭" },
    { value: "he", label: "עברית 🇮🇱" },
    { value: "fa", label: "فارسی 🇮🇷" },
    { value: "bn", label: "বাংলা 🇧🇩" },
    { value: "pa", label: "ਪੰਜਾਬੀ 🇮🇳" },
    { value: "mr", label: "मराठी 🇮🇳" },
    { value: "ta", label: "தமிழ் 🇮🇳" },
    { value: "te", label: "తెలుగు 🇮🇳" },
    { value: "ur", label: "اردو 🇵🇰" },
    { value: "sw", label: "Kiswahili 🇰🇪" },
    { value: "am", label: "አማርኛ 🇪🇹" },
    { value: "az", label: "Azərbaycan 🇦🇿" },
    { value: "uz", label: "Oʻzbekcha 🇺🇿" },
    { value: "kk", label: "Қазақша 🇰🇿" },
    { value: "ka", label: "ქართული 🇬🇪" },
    { value: "sk", label: "Slovenčina 🇸🇰" },
    { value: "hr", label: "Hrvatski 🇭🇷" },
    { value: "bg", label: "Български 🇧🇬" },
    { value: "sr", label: "Српски 🇷🇸" },
    { value: "sl", label: "Slovenščina 🇸🇮" },
    { value: "et", label: "Eesti 🇪🇪" },
    { value: "lv", label: "Latviešu 🇱🇻" },
    { value: "lt", label: "Lietuvių 🇱🇹" },
    { value: "is", label: "Íslenska 🇮🇸" },
    { value: "af", label: "Afrikaans 🇿🇦" },
    { value: "my", label: "မြန်မာဘာသာ 🇲🇲" },
    { value: "km", label: "ភាសាខ្មែរ 🇰🇭" },
    { value: "lo", label: "ພາສາລາວ 🇱🇦" },
    { value: "sq", label: "Shqip 🇦🇱" },
    { value: "hy", label: "Հայերեն 🇦🇲" },
    { value: "eu", label: "Euskara 🇪🇸" },
    { value: "be", label: "Беларуская 🇧🇾" },
    { value: "bs", label: "Bosanski 🇧🇦" },
    { value: "ca", label: "Català 🇪🇸" },
    { value: "gl", label: "Galego 🇪🇸" },
    { value: "gu", label: "ગુજરાતી 🇮🇳" },
    { value: "kn", label: "ಕನ್ನಡ 🇮🇳" },
    { value: "ml", label: "മലയാളം 🇮🇳" },
    { value: "mn", label: "Монгол 🇲🇳" },
    { value: "ne", label: "नेपाली 🇳🇵" },
    { value: "si", label: "සිංහල 🇱🇰" },
    { value: "tg", label: "Toҷикӣ 🇹🇯" },
    { value: "tk", label: "Türkmençe 🇹🇲" },
    { value: "cy", label: "Cymraeg 󠁧󠁢󠁷󠁬󠁳󠁿" },
    { value: "yo", label: "Yorùbá 🇳🇬" },
    { value: "zu", label: "isiZulu 🇿🇦" }
];


export default function SettingsPage() {
    const t = useTranslations("Dashboard.settings");
    const tErrors = useTranslations("errors");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, updateProfile } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    const [profileName, setProfileName] = useState("");
    const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);
    const [highlightColor, setHighlightColor] = useState("#ffb13b");
    const [excludedDomains, setExcludedDomains] = useState("");
    const [dailyGoal, setDailyGoal] = useState<number>(10);
    const [dailyNewCardLimit, setDailyNewCardLimit] = useState<number>(20);
    const [dailyReviewLimit, setDailyReviewLimit] = useState<number>(100);
    const [targetLanguage, setTargetLanguage] = useState("en");
    const [nativeLanguage, setNativeLanguage] = useState("vi");
    const [defaultTranslator, setDefaultTranslator] = useState("google");
    const [isTesting, setIsTesting] = useState(false);
    const [preferencesJson, setPreferencesJson] = useState<string>("{}");
    const [customLlmsJson, setCustomLlmsJson] = useState<string>("[]");

    const [isEmailReminderEnabled, setIsEmailReminderEnabled] = useState(true);
    const [isTelegramReminderEnabled, setIsTelegramReminderEnabled] = useState(false);
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    const [isZaloReminderEnabled, setIsZaloReminderEnabled] = useState(false);
    const [zaloBotToken, setZaloBotToken] = useState("");
    const [zaloUserId, setZaloUserId] = useState("");

    useEffect(() => {
        if (user?.fullName) setProfileName(user.fullName);
        if (user?.avatarUrl) setProfileAvatarUrl(user.avatarUrl);

        const fetchSettings = async () => {
            const res = await settingsApi.get();
            if (res.success && res.data) {
                setIsHighlightEnabled(res.data.isHighlightEnabled);
                setHighlightColor(res.data.highlightColor || "#ffb13b");
                setExcludedDomains(res.data.excludedDomains?.join("\n") || "");
                setDailyGoal(res.data.dailyGoal || 10);
                setDailyNewCardLimit(res.data.dailyNewCardLimit || 20);
                setDailyReviewLimit(res.data.dailyReviewLimit || 100);
                setTargetLanguage(res.data.targetLanguage || "en");
                setNativeLanguage(res.data.nativeLanguage || "vi");
                if (res.data.defaultTranslator) setDefaultTranslator(res.data.defaultTranslator);
                setCustomLlmsJson(res.data.customLlmsJson || "[]");

                setIsEmailReminderEnabled(res.data.isEmailReminderEnabled ?? true);
                setIsTelegramReminderEnabled(res.data.isTelegramReminderEnabled ?? false);
                setTelegramBotToken(res.data.telegramBotToken || "");
                setTelegramChatId(res.data.telegramChatId || "");
                setIsZaloReminderEnabled(res.data.isZaloReminderEnabled ?? false);
                setZaloBotToken(res.data.zaloBotToken || "");
                setZaloUserId(res.data.zaloUserId || "");

                try {
                    const parsed = JSON.parse(res.data.preferencesJson || "{}");
                    setPreferencesJson(JSON.stringify(parsed, null, 2));
                } catch {
                    setPreferencesJson(res.data.preferencesJson || "{}");
                }
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, [user?.fullName, user?.avatarUrl]);

    const syncSettingField = async (payload: Record<string, unknown>) => {
        const res = await settingsApi.update(payload as any);
        if (res.success) {
            toast.success(t("saveSuccess"));
            return true;
        }

        showErrorToast(res, t("saveFailed"), tErrors);
        return false;
    };

    const handleUpdateProfile = async () => {
        if (!profileName.trim()) return;
        setIsUpdatingProfile(true);
        const success = await updateProfile({ fullName: profileName, avatarUrl: profileAvatarUrl ?? undefined });
        if (success) {
            toast.success(t("password.profileUpdated"));
        } else {
            toast.error(t("password.profileFailed"));
        }
        setIsUpdatingProfile(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);
        setIsChangingPassword(true);
        try {
            const res = await authApi.changePassword({ currentPassword, newPassword });
            if (res.success) {
                toast.success(t("password.successMsg"));
                setPasswordSuccess(t("password.successMsg"));
                setTimeout(() => {
                    logout();
                    router.push(`/${locale}/auth/login`);
                }, 2000);
            } else {
                showErrorToast(res, t("password.failMsg"), tErrors);
                setPasswordError(getErrorMessage(res, tErrors, t("password.failMsg")));
            }
        } catch {
            toast.error(t("unexpectedError"));
            setPasswordError(t("unexpectedError"));
        } finally {
            setIsChangingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
        }
    };

    const handleDeleteAccount = async () => {
        const res = await authApi.deleteAccount();
        if (res.success) {
            toast.success(t("account.deleteSuccess"));
            logout();
            router.push(`/${locale}/auth/login`);
        } else {
            showErrorToast(res, t("account.deleteFailed"), tErrors);
        }
        setConfirmDeleteOpen(false);
    };

    const handleRevokeAllSessions = async () => {
        setIsRevoking(true);
        try {
            const res = await authApi.revokeAllSessions();
            if (res.success) {
                toast.success(t("account.revokeSuccess"));
                logout();
                router.push(`/${locale}/auth/login`);
            } else {
                showErrorToast(res, t("account.revokeFailed"), tErrors);
            }
        } finally {
            setIsRevoking(false);
            setConfirmRevokeOpen(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let parsedPrefs = {};
            try {
                parsedPrefs = JSON.parse(preferencesJson);
            } catch {
                toast.error(t("extension.invalidJson"));
                setIsSaving(false);
                return;
            }
            const domains = excludedDomains
                .split("\n")
                .map(d => d.trim().toLowerCase())
                .filter(d => d.length > 0);
            const res = await settingsApi.update({
                isHighlightEnabled,
                highlightColor,
                excludedDomains: domains,
                dailyGoal: Number(dailyGoal),
                dailyNewCardLimit: Number(dailyNewCardLimit),
                dailyReviewLimit: Number(dailyReviewLimit),
                targetLanguage,
                nativeLanguage,
                defaultTranslator,
                customLlmsJson,
                preferencesJson: JSON.stringify(parsedPrefs),
                isEmailReminderEnabled,
                isTelegramReminderEnabled,
                telegramBotToken,
                telegramChatId,
                isZaloReminderEnabled,
                zaloBotToken,
                zaloUserId,
            });
            if (res.success) {
                toast.success(t("saveSuccess"));
            } else {
                showErrorToast(res, t("saveFailed"), tErrors);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestNotifications = async () => {
        setIsTesting(true);
        try {
            const res = await settingsApi.testNotifications({
                nativeLanguage,
                isTelegramReminderEnabled,
                telegramBotToken,
                telegramChatId,
                isZaloReminderEnabled,
                zaloBotToken,
                zaloUserId
            });
            if (res.success) {
                toast.success(t("notifications.testSuccess") || "Ping successful! Check your bots/email.");
            } else {
                showErrorToast(res, t("notifications.testError") || "Failed to trigger test ping.", tErrors);
            }
        } catch (error) {
            toast.error(t("notifications.testError") || tErrors("SERVICE_UNAVAILABLE"));
        } finally {
            setIsTesting(false);
        }
    };

    const initials = user?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <div className="space-y-8 pb-10 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Profile */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("profile.title")}</CardTitle>
                                <CardDescription>{t("profile.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-5 mb-6">
                                    <Avatar className="h-24 w-24 ring-2 ring-offset-4 ring-offset-background ring-primary/20 transition-all duration-300 hover:ring-primary/50 shadow-md">
                                        {profileAvatarUrl && (
                                            <AvatarImage 
                                                src={profileAvatarUrl} 
                                                alt={user?.fullName || "User Avatar"} 
                                                className="object-cover transition-opacity duration-300"
                                            />
                                        )}
                                        <AvatarFallback className="bg-primary/5 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2.5">
                                        <div>
                                            <h3 className="font-semibold text-xl tracking-tight leading-none mb-1.5">{user?.fullName}</h3>
                                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                {user?.role} Account
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="w-fit hover:bg-primary/10 transition-colors shadow-sm"
                                            onClick={() => {
                                                const seed = Math.random().toString(36).substring(7);
                                                setProfileAvatarUrl(`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`);
                                            }}
                                        >
                                            <span className="mr-2 text-base">🎲</span> {t("profile.randomizeAvatar") || "Randomize Avatar"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("profile.name")}</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                disabled={isUpdatingProfile}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleUpdateProfile}
                                                disabled={isUpdatingProfile || (profileName === user?.fullName && profileAvatarUrl === (user?.avatarUrl || null)) || !profileName.trim()}
                                            >
                                                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {t("profile.updateButton")}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("profile.email")}</label>
                                        <Input defaultValue={user?.email || ""} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-3 md:col-span-2 pt-4 border-t mt-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-primary" />
                                            {t("profile.languageLabel")}
                                        </label>
                                        <Select
                                            value={locale}
                                            onValueChange={(newLocale) => {
                                                const segments = pathname.split('/');
                                                segments[1] = newLocale;
                                                router.push(segments.join('/'));
                                            }}
                                        >
                                            <SelectTrigger className="w-full md:w-[250px]">
                                                <SelectValue placeholder={t("profile.languagePlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locales.map((l) => (
                                                    <SelectItem key={l} value={l}>{languageNames[l]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-primary" />
                                    {t("password.title")}
                                </CardTitle>
                                <CardDescription>{t("password.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-muted-foreground" />
                                            {t("password.currentLabel")}
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={isChangingPassword}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-muted-foreground" />
                                            {t("password.newLabel")}
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isChangingPassword}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
                                    {passwordSuccess && <p className="text-sm font-medium text-green-600">{passwordSuccess}</p>}
                                    <Button
                                        type="submit"
                                        disabled={isChangingPassword || !currentPassword || !newPassword}
                                        className="mt-2"
                                    >
                                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("password.submitButton")}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notification Preferences */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <form onSubmit={handleSave}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BellRing className="w-5 h-5 text-primary" />
                                        {t("notifications.title") || "Notification Preferences"}
                                    </CardTitle>
                                    <CardDescription>{t("notifications.desc") || "Manage how you receive review reminders."}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Email Reminders */}
                                    <div className="flex items-center justify-between border-b pb-6">
                                        <div className="space-y-0.5 pr-4">
                                            <label className="text-base font-medium flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                {t("notifications.emailTitle") || "Email Reminders"}
                                            </label>
                                            <p className="text-sm text-muted-foreground">{t("notifications.emailDesc") || "Receive reminders via email when you have vocabulary cards due for review."}</p>
                                        </div>
                                        <Switch checked={isEmailReminderEnabled} onCheckedChange={setIsEmailReminderEnabled} disabled={isSaving} />
                                    </div>

                                    {/* Telegram Reminders */}
                                    <div className="space-y-4 border-b pb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5 pr-4">
                                                <label className="text-base font-medium flex items-center gap-2">
                                                    <Send className="w-4 h-4 text-[#0088cc]" />
                                                    {t("notifications.telegramTitle") || "Telegram Reminders"}
                                                </label>
                                                <p className="text-sm text-muted-foreground">{t("notifications.telegramDesc") || "Receive reminders via your personal Telegram bot."}</p>
                                            </div>
                                            <Switch checked={isTelegramReminderEnabled} onCheckedChange={setIsTelegramReminderEnabled} disabled={isSaving} />
                                        </div>

                                        {isTelegramReminderEnabled && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 md:grid-cols-2 pt-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">{t("notifications.botToken") || "Bot Token"}</label>
                                                    <Input
                                                        type="password"
                                                        placeholder={t("notifications.botTokenPlaceholder") || "Enter your Bot Token"}
                                                        value={telegramBotToken}
                                                        onChange={(e) => setTelegramBotToken(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">{t("notifications.chatId") || "Chat ID"}</label>
                                                    <Input
                                                        placeholder={t("notifications.chatIdPlaceholder") || "Enter your Chat ID"}
                                                        value={telegramChatId}
                                                        onChange={(e) => setTelegramChatId(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground col-span-full pt-1">
                                                    {t.rich("notifications.telegramHint", {
                                                        a: (chunks) => <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">{chunks}</a>
                                                    })}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Zalo Reminders */}
                                    <div className="space-y-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5 pr-4">
                                                <label className="text-base font-medium flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4 text-[#0068ff]" />
                                                    {t("notifications.zaloTitle") || "Zalo Reminders"}
                                                </label>
                                                <p className="text-sm text-muted-foreground">{t("notifications.zaloDesc") || "Receive reminders via your Zalo Official Account bot."}</p>
                                            </div>
                                            <Switch checked={isZaloReminderEnabled} onCheckedChange={setIsZaloReminderEnabled} disabled={isSaving} />
                                        </div>

                                        {isZaloReminderEnabled && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 md:grid-cols-2 pt-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">{t("notifications.botToken") || "Bot Token"}</label>
                                                    <Input
                                                        type="password"
                                                        placeholder={t("notifications.botTokenPlaceholder") || "Enter your Bot Token"}
                                                        value={zaloBotToken}
                                                        onChange={(e) => setZaloBotToken(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">{t("notifications.userId") || "User ID"}</label>
                                                    <Input
                                                        placeholder={t("notifications.userIdPlaceholder") || "Enter your User ID"}
                                                        value={zaloUserId}
                                                        onChange={(e) => setZaloUserId(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground col-span-full pt-1">
                                                    {t.rich("notifications.zaloHint", {
                                                        a: (chunks) => <a href="https://bot.zapps.me/docs/create-bot/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">{chunks}</a>
                                                    })}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4 bg-muted/20 flex justify-between items-center">
                                    <Button type="button" variant="outline" size="sm" onClick={handleTestNotifications} disabled={isSaving || isTesting}>
                                        {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                                        Test Notifications
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("save")}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </motion.div>

                    {/* Extension Preferences */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <form onSubmit={handleSave}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("extension.title")}</CardTitle>
                                    <CardDescription>{t("extension.desc")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="flex items-center justify-between border-b pb-6">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-primary" />
                                                {t("extension.highlightToggleLabel")}
                                            </label>
                                            <p className="text-sm text-muted-foreground">{t("extension.highlightToggleDesc")}</p>
                                        </div>
                                        <Switch checked={isHighlightEnabled} onCheckedChange={setIsHighlightEnabled} />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 border-b pb-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">{t("extension.highlightColorLabel")}</label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="color"
                                                    value={highlightColor}
                                                    onChange={(e) => setHighlightColor(e.target.value)}
                                                    className="w-14 h-12 p-1 cursor-pointer"
                                                    disabled={!isHighlightEnabled}
                                                />
                                                <Input
                                                    value={highlightColor}
                                                    onChange={(e) => setHighlightColor(e.target.value)}
                                                    className="w-32 uppercase font-mono"
                                                    disabled={!isHighlightEnabled}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t("extension.highlightColorDesc")}</p>
                                        </div>
                                    </div>

                                    {/* App Goals & Limits */}
                                    <div className="grid gap-6 md:grid-cols-3 border-b pb-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-slate-500" />
                                                {t("extension.dailyGoalLabel") || "Daily Capture"}
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={500}
                                                value={dailyGoal}
                                                onChange={(e) => setDailyGoal(Number(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">{t("extension.dailyGoalDesc") || "Words to save via extension."}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-emerald-500" />
                                                {t("extension.dailyNewCardLimitLabel") || "New Cards / Day"}
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={500}
                                                value={dailyNewCardLimit}
                                                onChange={(e) => setDailyNewCardLimit(Number(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">{t("extension.dailyNewCardLimitDesc") || "New flashcards to learn."}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-purple-500" />
                                                {t("extension.dailyReviewLimitLabel") || "Review Limit / Day"}
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={2000}
                                                value={dailyReviewLimit}
                                                onChange={(e) => setDailyReviewLimit(Number(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">{t("extension.dailyReviewLimitDesc") || "Max cards to review."}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 border-b pb-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-emerald-500" />
                                                {t("extension.learningLanguageLabel") || "Learning Language"}
                                            </label>
                                            <Select
                                                value={targetLanguage}
                                                onValueChange={async (val) => {
                                                    setTargetLanguage(val);
                                                    await syncSettingField({ targetLanguage: val });
                                                }}
                                                disabled={!isHighlightEnabled}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select learning language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                                        <SelectItem key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">{t("extension.learningLanguageDesc") || "The language you are studying (e.g., English)."}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                                {t("extension.nativeLanguageLabel") || "Native Language"}
                                            </label>
                                            <Select
                                                value={nativeLanguage}
                                                onValueChange={async (val) => {
                                                    setNativeLanguage(val);
                                                    await syncSettingField({ nativeLanguage: val });
                                                }}
                                                disabled={!isHighlightEnabled}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select native language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                                        <SelectItem key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">{t("extension.nativeLanguageDesc") || "The language used for UI texts and explanations."}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pb-6 border-b">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            {t("extension.defaultTranslatorLabel") || "Default Translation Provider"}
                                        </label>
                                        <div className="w-full md:w-[250px]">
                                            <QuickModelSwitcher
                                                provider={defaultTranslator}
                                                setProvider={async (val) => {
                                                    setDefaultTranslator(val);
                                                    await syncSettingField({ defaultTranslator: val });
                                                }}
                                                hideTrigger={true}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{t("extension.defaultTranslatorDesc") || "Select the underlying AI or model that powers real-time translation and Smart Bubble."}</p>
                                    </div>

                                    {/* Custom LLM Manager */}
                                    <div className="pb-6 border-b">
                                        <CustomLlmManager customLlmsJson={customLlmsJson} onChange={setCustomLlmsJson} />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                                            {t("extension.excludedDomainsLabel")}
                                        </label>
                                        <Textarea
                                            placeholder={t("extension.excludedDomainsPlaceholder")}
                                            rows={4}
                                            value={excludedDomains}
                                            onChange={(e) => setExcludedDomains(e.target.value)}
                                            className="font-mono text-sm"
                                            disabled={!isHighlightEnabled}
                                        />
                                        <p className="text-xs text-muted-foreground">{t("extension.excludedDomainsDesc")}</p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Code className="w-4 h-4 text-purple-500" />
                                            {t("extension.advancedLabel")}
                                        </label>
                                        <Textarea
                                            placeholder="{}"
                                            rows={6}
                                            value={preferencesJson}
                                            onChange={(e) => setPreferencesJson(e.target.value)}
                                            className="font-mono text-sm bg-muted/50"
                                        />
                                        <p className="text-xs text-muted-foreground">{t("extension.advancedDesc")}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4 bg-muted/20">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("save")}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">{t("account.title")}</CardTitle>
                                <CardDescription>{t("account.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4">
                                <Button variant="outline" type="button" onClick={logout}>
                                    {t("account.logOut")}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setConfirmRevokeOpen(true)}
                                    className="text-orange-600 hover:bg-orange-50 border-orange-200"
                                    disabled={isRevoking}
                                >
                                    {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("account.revokeAllSessions")}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                    className="text-destructive hover:bg-destructive/10"
                                >
                                    {t("account.deleteAccount")}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title={t("confirmDelete.title")}
                description={t("confirmDelete.description")}
                onConfirm={handleDeleteAccount}
                confirmText={t("confirmDelete.confirmText")}
                variant="destructive"
            />

            <ConfirmDialog
                open={confirmRevokeOpen}
                onOpenChange={setConfirmRevokeOpen}
                title={t("confirmRevoke.title")}
                description={t("confirmRevoke.description")}
                onConfirm={handleRevokeAllSessions}
                confirmText={isRevoking ? t("confirmRevoke.confirmingText") : t("confirmRevoke.confirmText")}
                variant="destructive"
            />
        </div>
    );
}
