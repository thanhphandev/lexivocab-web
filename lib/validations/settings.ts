import * as z from "zod";

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type PasswordInput = z.infer<typeof passwordSchema>;

export const settingsSchema = z.object({
  isHighlightEnabled: z.boolean(),
  highlightColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: "Invalid hex color" }).optional().or(z.literal("")),
  dailyGoal: z.coerce.number().min(1).max(500),
  dailyNewCardLimit: z.coerce.number().min(1).max(500),
  dailyReviewLimit: z.coerce.number().min(1).max(2000),
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  defaultTranslator: z.string(),
  customLlmsJson: z.string(),
  preferencesJson: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
        return false;
    }
  }, { message: "Invalid JSON format" }),
  excludedDomains: z.string(),

  isEmailReminderEnabled: z.boolean(),
  isTelegramReminderEnabled: z.boolean(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),

  isZaloReminderEnabled: z.boolean(),
  zaloBotToken: z.string().optional(),
  zaloUserId: z.string().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
