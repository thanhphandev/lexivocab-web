import { useState, useEffect } from "react";
import { settingsApi } from "@/lib/api/api-client";
import { UseFormReturn } from "react-hook-form";
import { SettingsInput } from "@/lib/validations/settings";

export function useSettingsData(form: UseFormReturn<SettingsInput>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await settingsApi.get();
      if (res.success && res.data) {
        let prefs = res.data.preferencesJson || "{}";
        try {
          const parsed = JSON.parse(prefs);
          prefs = JSON.stringify(parsed, null, 2);
        } catch {
          // ignore
        }

        form.reset({
          isHighlightEnabled: res.data.isHighlightEnabled ?? true,
          highlightColor: res.data.highlightColor || "#ffb13b",
          excludedDomains: res.data.excludedDomains?.join("\n") || "",
          dailyGoal: res.data.dailyGoal || 10,
          dailyNewCardLimit: res.data.dailyNewCardLimit || 20,
          dailyReviewLimit: res.data.dailyReviewLimit || 100,
          targetLanguage: res.data.targetLanguage || "en",
          nativeLanguage: res.data.nativeLanguage || "vi",
          defaultTranslator: res.data.defaultTranslator || "google",
          customLlmsJson: res.data.customLlmsJson || "[]",
          preferencesJson: prefs,
          isEmailReminderEnabled: res.data.isEmailReminderEnabled ?? true,
          isTelegramReminderEnabled: res.data.isTelegramReminderEnabled ?? false,
          telegramBotToken: res.data.telegramBotToken || "",
          telegramChatId: res.data.telegramChatId || "",
          isZaloReminderEnabled: res.data.isZaloReminderEnabled ?? false,
          zaloBotToken: res.data.zaloBotToken || "",
          zaloUserId: res.data.zaloUserId || "",
        });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [form]);

  return { isLoading };
}
