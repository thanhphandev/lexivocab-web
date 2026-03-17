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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2, Palette, ShieldAlert, Target, Code, Globe, Lock, KeyRound } from "lucide-react";
import { clientApi, authApi, settingsApi } from "@/lib/api/api-client";
import type { UserSettingsDto } from "@/lib/api/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";


export default function SettingsPage() {
    const t = useTranslations("Dashboard.settings");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, updateProfile } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    // Profile State
    const [profileName, setProfileName] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Form state
    const [isHighlightEnabled, setIsHighlightEnabled] = useState(true);
    const [highlightColor, setHighlightColor] = useState("#ffb13b");
    const [excludedDomains, setExcludedDomains] = useState("");
    const [dailyGoal, setDailyGoal] = useState<number>(10);
    const [preferencesJson, setPreferencesJson] = useState<string>("{}");

    useEffect(() => {
        if (user?.fullName) {
             setProfileName(user.fullName);
        }

        const fetchSettings = async () => {
            const res = await settingsApi.get();
            if (res.success && res.data) {
                setIsHighlightEnabled(res.data.isHighlightEnabled);
                setHighlightColor(res.data.highlightColor || "#ffb13b");
                setExcludedDomains(res.data.excludedDomains?.join("\n") || "");
                setDailyGoal(res.data.dailyGoal || 10);

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
    }, [user?.fullName]);


    const handleUpdateProfile = async () => {
        if (!profileName.trim()) return;
        setIsUpdatingProfile(true);
        const success = await updateProfile({ fullName: profileName });
        if (success) {
            toast.success("Profile updated successfully.");
        } else {
            toast.error("Failed to update profile.");
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
                 toast.success("Password changed successfully. Please log in again.");
                 setPasswordSuccess("Password changed successfully. Please log in again.");
                 setTimeout(() => {
                     logout();
                     router.push(`/${locale}/auth/login`);
                 }, 2000);
             } else {
                 toast.error(res.error || "Failed to change password.");
                 setPasswordError(res.error || "Failed to change password.");
             }
        } catch {
             toast.error("An unexpected error occurred.");
             setPasswordError("An unexpected error occurred.");
        } finally {
             setIsChangingPassword(false);
             setCurrentPassword("");
             setNewPassword("");
        }
    };

    const handleDeleteAccount = async () => {
        const res = await authApi.deleteAccount();
        if (res.success) {
            toast.success("Your account has been permanently deleted.");
            logout();
            router.push(`/${locale}/auth/login`);
        } else {
            toast.error("Failed to delete account: " + res.error);
        }
        setConfirmDeleteOpen(false);
    };

    const handleRevokeAllSessions = async () => {
        setIsRevoking(true);
        try {
            const res = await authApi.revokeAllSessions();
            if (res.success) {
                toast.success("All sessions revoked. Please log in again.");
                logout();
                router.push(`/${locale}/auth/login`);
            } else {
                toast.error(res.error || "Failed to revoke sessions.");
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
            } catch (err) {
                toast.error("Invalid JSON format in advanced preferences.");
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
                preferencesJson: JSON.stringify(parsedPrefs),
            });


            if (res.success) {
                toast.success("Settings saved successfully.");
            } else {
                toast.error(`Failed to save settings: ${res.error}`);
            }
        } finally {
            setIsSaving(false);
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("title")}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Profile Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("profile.title")}</CardTitle>
                                <CardDescription>{t("profile.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium text-lg">{user?.fullName}</h3>
                                        <p className="text-sm text-muted-foreground">{user?.role} Account</p>
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
                                                disabled={isUpdatingProfile || profileName === user?.fullName || !profileName.trim()}
                                            >
                                                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("profile.email")}</label>
                                        <Input defaultValue={user?.email || ""} disabled className="bg-muted" />
                                    </div>

                                    {/* Language Selection */}
                                    <div className="space-y-3 md:col-span-2 pt-4 border-t mt-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-primary" />
                                            Language Interface
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
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locales.map((l) => (
                                                    <SelectItem key={l} value={l}>
                                                        {languageNames[l]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Sets the default display language for your dashboard.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-primary" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => handleChangePassword(e)} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-muted-foreground" />
                                            Current Password
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
                                            New Password
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
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Chrome Extension Preferences */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <form onSubmit={handleSave}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Extension Preferences</CardTitle>
                                    <CardDescription>Customize how LexiVocab behaves in your browser.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Highlight Feature Toggle */}
                                    <div className="flex items-center justify-between border-b pb-6">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-primary" />
                                                Enable Word Highlighting
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically highlight your active vocabulary words on web pages.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isHighlightEnabled}
                                            onCheckedChange={setIsHighlightEnabled}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 border-b pb-6">
                                        {/* Highlight Color */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Highlight Color</label>
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
                                            <p className="text-xs text-muted-foreground">Custom background color for highlighted words.</p>
                                        </div>

                                        {/* Daily Goal */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4" />
                                                Daily Review Goal
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={500}
                                                value={dailyGoal}
                                                onChange={(e) => setDailyGoal(Number(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">How many words do you want to review per day?</p>
                                        </div>
                                    </div>

                                    {/* Excluded Domains */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                                            Excluded Domains
                                        </label>
                                        <Textarea
                                            placeholder="example.com&#10;reddit.com"
                                            rows={4}
                                            value={excludedDomains}
                                            onChange={(e) => setExcludedDomains(e.target.value)}
                                            className="font-mono text-sm"
                                            disabled={!isHighlightEnabled}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            LexiVocab will disable highlighting on these websites. Add one domain per line.
                                        </p>
                                    </div>

                                    {/* Advanced JSON Preferences */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Code className="w-4 h-4 text-purple-500" />
                                            Advanced Configuration (JSON)
                                        </label>
                                        <Textarea
                                            placeholder="{}"
                                            rows={6}
                                            value={preferencesJson}
                                            onChange={(e) => setPreferencesJson(e.target.value)}
                                            className="font-mono text-sm bg-muted/50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Raw JSON settings synchronized from your browser extension. Modify with caution!
                                        </p>
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">{t("account.title")}</CardTitle>
                                <CardDescription>{t("account.desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4">
                                <Button variant="outline" type="button" onClick={logout}>
                                    Log Out
                                </Button>
                                <Button variant="outline" type="button" onClick={() => setConfirmRevokeOpen(true)} className="text-orange-600 hover:bg-orange-50 border-orange-200" disabled={isRevoking}>
                                    {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Revoke All Sessions
                                </Button>
                                <Button variant="outline" type="button" onClick={() => setConfirmDeleteOpen(true)} className="text-destructive hover:bg-destructive/10">
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
                title="Delete My Account"
                description="Are you sure you want to permanently delete your account? This action is irreversible and all your vocabulary progress will be lost forever."
                onConfirm={handleDeleteAccount}
                confirmText="Delete Account"
                variant="destructive"
            />

            <ConfirmDialog
                open={confirmRevokeOpen}
                onOpenChange={setConfirmRevokeOpen}
                title="Revoke All Sessions"
                description="This will immediately sign you out from all devices (browser, extension, mobile). You will need to log in again on each device."
                onConfirm={handleRevokeAllSessions}
                confirmText={isRevoking ? "Revoking..." : "Revoke All"}
                variant="destructive"
            />
        </div>
    );
}
