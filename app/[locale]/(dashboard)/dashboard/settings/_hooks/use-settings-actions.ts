import { toast } from "sonner";
import { settingsApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";

interface UseSettingsActionsProps {
  t: (key: string) => string;
  tErrors: (key: string) => string;
}

export function useSettingsActions({ t, tErrors }: UseSettingsActionsProps) {
  const syncSettingField = async (payload: Record<string, unknown>) => {
    const res = await settingsApi.update(payload as any);
    if (res.success) {
      toast.success(t("saveSuccess"));
      return true;
    }

    showErrorToast(res, t("saveFailed"), tErrors);
    return false;
  };

  const handleTestNotifications = async (settings: {
    nativeLanguage: string;
    isTelegramReminderEnabled: boolean;
    telegramBotToken: string;
    telegramChatId: string;
    isZaloReminderEnabled: boolean;
    zaloBotToken: string;
    zaloUserId: string;
  }) => {
    try {
      const res = await settingsApi.testNotifications(settings);
      if (res.success) {
        toast.success(t("notifications.testSuccess") || "Ping successful! Check your bots/email.");
      } else {
        showErrorToast(res, t("notifications.testError") || "Failed to trigger test ping.", tErrors);
      }
    } catch (error) {
      toast.error(t("notifications.testError") || tErrors("SERVICE_UNAVAILABLE"));
    }
  };

  return { syncSettingField, handleTestNotifications };
}
