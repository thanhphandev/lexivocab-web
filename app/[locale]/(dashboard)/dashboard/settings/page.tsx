 
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2, User, Lock, Bell, Puzzle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { ProfileSection } from "./_components/profile-section";
import { PasswordSection } from "./_components/password-section";
import { NotificationSection } from "./_components/notification-section";
import { ExtensionSection } from "./_components/extension-section";
import { DangerZoneSection } from "./_components/danger-zone-section";
import { useSettingsData } from "./_hooks/use-settings-data";
import { useSettingsActions } from "./_hooks/use-settings-actions";
import { useProfileActions } from "./_hooks/use-profile-actions";
import { usePasswordChange } from "./_hooks/use-password-change";
import { useAccountActions } from "./_hooks/use-account-actions";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsInput } from "@/lib/validations/settings";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "password" | "notifications" | "extension" | "danger";

const tabs = [
  { id: "profile" as const, icon: User, labelKey: "tabs.profile" },
  { id: "password" as const, icon: Lock, labelKey: "tabs.password" },
  { id: "notifications" as const, icon: Bell, labelKey: "tabs.notifications" },
  { id: "extension" as const, icon: Puzzle, labelKey: "tabs.extension" },
  { id: "danger" as const, icon: AlertTriangle, labelKey: "tabs.danger" },
];

export default function SettingsPage() {
  const t = useTranslations("Dashboard.settings");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { user, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

   
  const settingsForm = useForm<any>({
     
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      isHighlightEnabled: true,
      highlightColor: "#ffb13b",
      excludedDomains: "",
      dailyGoal: 10,
      dailyNewCardLimit: 20,
      dailyReviewLimit: 100,
      targetLanguage: "en",
      nativeLanguage: "vi",
      defaultTranslator: "google",
      customLlmsJson: "[]",
      preferencesJson: "{}",
      isEmailReminderEnabled: true,
      isTelegramReminderEnabled: false,
      telegramBotToken: "",
      telegramChatId: "",
      isZaloReminderEnabled: false,
      zaloBotToken: "",
      zaloUserId: "",
    }
  });

  const { isLoading } = useSettingsData(settingsForm);
  const { syncSettingField, handleTestNotifications: testNotifications } = useSettingsActions({
    t,
    tErrors,
  });
  const { isUpdatingProfile, handleUpdateProfile } = useProfileActions({ t, updateProfile });
  const passwordChange = usePasswordChange({ t, tErrors, locale, logout });
  const accountActions = useAccountActions({ t, tErrors, locale, logout });

  const handleSave = async (data: SettingsInput) => {
    setIsSaving(true);
    try {
      let parsedPrefs = {};
      try {
        parsedPrefs = JSON.parse(data.preferencesJson);
      } catch {
        toast.error(t("extension.invalidJson"));
        setIsSaving(false);
        return;
      }
      const domains = data.excludedDomains
        .split("\n")
        .map((d) => d.trim().toLowerCase())
        .filter((d) => d.length > 0);

      const res = await settingsApi.update({
        ...data,
         
        excludedDomains: domains as any,
        preferencesJson: JSON.stringify(parsedPrefs),
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

  const handleTestNotificationsWrapper = async () => {
    setIsTesting(true);
    const data = settingsForm.getValues();
    await testNotifications({
      nativeLanguage: data.nativeLanguage,
      isTelegramReminderEnabled: data.isTelegramReminderEnabled ?? false,
      telegramBotToken: data.telegramBotToken || "",
      telegramChatId: data.telegramChatId || "",
      isZaloReminderEnabled: data.isZaloReminderEnabled ?? false,
      zaloBotToken: data.zaloBotToken || "",
      zaloUserId: data.zaloUserId || "",
    });
    setIsTesting(false);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.6, repeat: Infinity }
          }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="pb-10 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <motion.aside 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <nav className="sticky top-6 space-y-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDanger = tab.id === "danger";
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-accent/50",
                    isActive && "bg-accent text-accent-foreground shadow-sm",
                    !isActive && "text-muted-foreground hover:text-foreground",
                    isDanger && !isActive && "hover:bg-destructive/10 hover:text-destructive",
                    isDanger && isActive && "bg-destructive/10 text-destructive"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(tab.labelKey)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </motion.aside>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "profile" && (
                <ProfileSection
                  t={t}
                  locale={locale}
                  user={user}
                  isUpdatingProfile={isUpdatingProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

              {activeTab === "password" && (
                <PasswordSection
                  t={t}
                  form={passwordChange.form}
                  onSubmit={passwordChange.onSubmit}
                  isChangingPassword={passwordChange.isChangingPassword}
                  passwordError={passwordChange.passwordError}
                  passwordSuccess={passwordChange.passwordSuccess}
                />
              )}

              {activeTab === "notifications" && (
                <FormProvider {...settingsForm}>
                  <NotificationSection
                    t={t}
                    isSaving={isSaving}
                    isTesting={isTesting}
                    onTest={handleTestNotificationsWrapper}
                    onSubmit={settingsForm.handleSubmit(handleSave)}
                  />
                </FormProvider>
              )}

              {activeTab === "extension" && (
                <FormProvider {...settingsForm}>
                  <ExtensionSection
                    t={t}
                    isSaving={isSaving}
                    onSubmit={settingsForm.handleSubmit(handleSave)}
                    syncSettingField={syncSettingField}
                  />
                </FormProvider>
              )}

              {activeTab === "danger" && (
                <DangerZoneSection
                  t={t}
                  isRevoking={accountActions.isRevoking}
                  onLogout={logout}
                  onRevokeAllSessions={() => accountActions.setConfirmRevokeOpen(true)}
                  onDeleteAccount={() => accountActions.setConfirmDeleteOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={accountActions.confirmDeleteOpen}
        onOpenChange={accountActions.setConfirmDeleteOpen}
        title={t("confirmDelete.title")}
        description={t("confirmDelete.description")}
        onConfirm={accountActions.handleDeleteAccount}
        confirmText={t("confirmDelete.confirmText")}
        variant="destructive"
      />

      <ConfirmDialog
        open={accountActions.confirmRevokeOpen}
        onOpenChange={accountActions.setConfirmRevokeOpen}
        title={t("confirmRevoke.title")}
        description={t("confirmRevoke.description")}
        onConfirm={accountActions.handleRevokeAllSessions}
        confirmText={
          accountActions.isRevoking
            ? t("confirmRevoke.confirmingText")
            : t("confirmRevoke.confirmText")
        }
        variant="destructive"
      />
    </motion.div>
  );
}
