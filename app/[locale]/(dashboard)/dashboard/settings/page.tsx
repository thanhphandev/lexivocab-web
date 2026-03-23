 
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2 } from "lucide-react";
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

export default function SettingsPage() {
  const t = useTranslations("Dashboard.settings");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { user, logout, updateProfile } = useAuth();

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
          <ProfileSection
            t={t}
            locale={locale}
            user={user}
            isUpdatingProfile={isUpdatingProfile}
            onUpdateProfile={handleUpdateProfile}
          />

          <PasswordSection
            t={t}
            form={passwordChange.form}
            onSubmit={passwordChange.onSubmit}
            isChangingPassword={passwordChange.isChangingPassword}
            passwordError={passwordChange.passwordError}
            passwordSuccess={passwordChange.passwordSuccess}
          />

          <FormProvider {...settingsForm}>
            <NotificationSection
              t={t}
              isSaving={isSaving}
              isTesting={isTesting}
              onTest={handleTestNotificationsWrapper}
              onSubmit={settingsForm.handleSubmit(handleSave)}
            />

            <ExtensionSection
              t={t}
              isSaving={isSaving}
              onSubmit={settingsForm.handleSubmit(handleSave)}
              syncSettingField={syncSettingField}
            />
          </FormProvider>

          <DangerZoneSection
            t={t}
            isRevoking={accountActions.isRevoking}
            onLogout={logout}
            onRevokeAllSessions={() => accountActions.setConfirmRevokeOpen(true)}
            onDeleteAccount={() => accountActions.setConfirmDeleteOpen(true)}
          />
        </div>
      )}

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
    </div>
  );
}
