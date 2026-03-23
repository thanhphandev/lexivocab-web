import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url().optional().nullable(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const notificationSettingsSchema = z.object({
  isEmailReminderEnabled: z.boolean().default(true),
  isTelegramReminderEnabled: z.boolean().default(false),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  isZaloReminderEnabled: z.boolean().default(false),
  zaloBotToken: z.string().optional(),
  zaloUserId: z.string().optional(),
});

export const extensionSettingsSchema = z.object({
  isHighlightEnabled: z.boolean().default(true),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffb13b"),
  excludedDomains: z.array(z.string()).default([]),
  dailyGoal: z.number().int().positive().default(10),
  dailyNewCardLimit: z.number().int().positive().default(20),
  dailyReviewLimit: z.number().int().positive().default(100),
  targetLanguage: z.string().default("en"),
  nativeLanguage: z.string().default("vi"),
  defaultTranslator: z.string().default("google"),
  customLlmsJson: z.string().default("[]"),
  preferencesJson: z.string().default("{}"),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type ExtensionSettings = z.infer<typeof extensionSettingsSchema>;
