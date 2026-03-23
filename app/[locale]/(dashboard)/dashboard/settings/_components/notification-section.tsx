 
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellRing, Mail, Send, MessageCircle, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { SettingsInput } from "@/lib/validations/settings";

interface NotificationSectionProps {
  t: any; // Using any for next-intl's rich text support
  isSaving: boolean;
  isTesting: boolean;
  onTest: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NotificationSection(props: NotificationSectionProps) {
  const { t, isSaving, isTesting, onTest, onSubmit } = props;
  const { register, watch, setValue, formState: { errors } } = useFormContext<SettingsInput>();
  
  const isEmailReminderEnabled = watch("isEmailReminderEnabled");
  const isTelegramReminderEnabled = watch("isTelegramReminderEnabled");
  const isZaloReminderEnabled = watch("isZaloReminderEnabled");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-primary" />
              {t("notifications.title") || "Notification Preferences"}
            </CardTitle>
            <CardDescription>
              {t("notifications.desc") || "Manage how you receive review reminders."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Email Reminders */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="space-y-0.5 pr-4">
                <label className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  {t("notifications.emailTitle") || "Email Reminders"}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.emailDesc") ||
                    "Receive reminders via email when you have vocabulary cards due for review."}
                </p>
              </div>
              <Switch
                checked={isEmailReminderEnabled}
                onCheckedChange={(val) => setValue("isEmailReminderEnabled", val, { shouldDirty: true })}
                disabled={isSaving}
              />
            </div>

            {/* Telegram Reminders */}
            <div className="space-y-4 border-b pb-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <label className="text-base font-medium flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#0088cc]" />
                    {t("notifications.telegramTitle") || "Telegram Reminders"}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.telegramDesc") ||
                      "Receive reminders via your personal Telegram bot."}
                  </p>
                </div>
                <Switch
                  checked={isTelegramReminderEnabled}
                  onCheckedChange={(val) => setValue("isTelegramReminderEnabled", val, { shouldDirty: true })}
                  disabled={isSaving}
                />
              </div>

              {isTelegramReminderEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid gap-4 md:grid-cols-2 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("notifications.botToken") || "Bot Token"}
                    </label>
                    <Input
                      type="password"
                      placeholder={
                        t("notifications.botTokenPlaceholder") || "Enter your Bot Token"
                      }
                      {...register("telegramBotToken")}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("notifications.chatId") || "Chat ID"}
                    </label>
                    <Input
                      placeholder={t("notifications.chatIdPlaceholder") || "Enter your Chat ID"}
                      {...register("telegramChatId")}
                      disabled={isSaving}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground col-span-full pt-1">
                    {t.rich("notifications.telegramHint", {
                      a: (chunks: any) => (
                        <a
                          href="https://t.me/BotFather"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {chunks}
                        </a>
                      ),
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
                  <p className="text-sm text-muted-foreground">
                    {t("notifications.zaloDesc") ||
                      "Receive reminders via your Zalo Official Account bot."}
                  </p>
                </div>
                <Switch
                  checked={isZaloReminderEnabled}
                  onCheckedChange={(val) => setValue("isZaloReminderEnabled", val, { shouldDirty: true })}
                  disabled={isSaving}
                />
              </div>

              {isZaloReminderEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid gap-4 md:grid-cols-2 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("notifications.botToken") || "Bot Token"}
                    </label>
                    <Input
                      type="password"
                      placeholder={
                        t("notifications.botTokenPlaceholder") || "Enter your Bot Token"
                      }
                      {...register("zaloBotToken")}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("notifications.userId") || "User ID"}
                    </label>
                    <Input
                      placeholder={t("notifications.userIdPlaceholder") || "Enter your User ID"}
                      {...register("zaloUserId")}
                      disabled={isSaving}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground col-span-full pt-1">
                    {t.rich("notifications.zaloHint", {
                      a: (chunks: any) => (
                        <a
                          href="https://bot.zapps.me/docs/create-bot/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {chunks}
                        </a>
                      ),
                    })}
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-muted/20 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onTest}
              disabled={isSaving || isTesting}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
              )}
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
  );
}
