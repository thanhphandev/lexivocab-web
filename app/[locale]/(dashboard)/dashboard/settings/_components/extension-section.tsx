"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Target, Globe, Sparkles, ShieldAlert, Code, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CustomLlmManager } from "@/components/settings/custom-llm-manager";
import { QuickModelSwitcher } from "@/components/ai/quick-model-switcher";
import { SUPPORTED_LANGUAGES } from "../_constants/languages";
import { useFormContext } from "react-hook-form";
import { SettingsInput } from "@/lib/validations/settings";

interface ExtensionSectionProps {
  t: (key: string) => string;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  syncSettingField: (payload: Record<string, unknown>) => Promise<boolean>;
}

export function ExtensionSection(props: ExtensionSectionProps) {
  const { t, isSaving, onSubmit, syncSettingField } = props;
  const { register, watch, setValue, formState: { errors } } = useFormContext<SettingsInput>();
  
  const isHighlightEnabled = watch("isHighlightEnabled");
  const highlightColor = watch("highlightColor");
  const targetLanguage = watch("targetLanguage");
  const nativeLanguage = watch("nativeLanguage");
  const defaultTranslator = watch("defaultTranslator");
  const customLlmsJson = watch("customLlmsJson");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("extension.title")}</CardTitle>
            <CardDescription>{t("extension.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Highlight Toggle */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="space-y-0.5">
                <label className="text-base font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  {t("extension.highlightToggleLabel")}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t("extension.highlightToggleDesc")}
                </p>
              </div>
              <Switch
                checked={isHighlightEnabled}
                onCheckedChange={(val) => setValue("isHighlightEnabled", val, { shouldDirty: true })}
              />
            </div>

            {/* Highlight Color */}
            <div className="grid gap-6 md:grid-cols-2 border-b pb-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">{t("extension.highlightColorLabel")}</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={highlightColor || "#ffb13b"}
                    onChange={(e) => setValue("highlightColor", e.target.value, { shouldDirty: true })}
                    className="w-14 h-12 p-1 cursor-pointer"
                    disabled={!isHighlightEnabled}
                  />
                  <Input
                    {...register("highlightColor")}
                    className="w-32 uppercase font-mono"
                    disabled={!isHighlightEnabled}
                  />
                </div>
                {errors.highlightColor && <p className="text-sm text-destructive">{errors.highlightColor.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {t("extension.highlightColorDesc")}
                </p>
              </div>
            </div>

            {/* Goals & Limits */}
            <div className="grid gap-6 md:grid-cols-3 border-b pb-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  {t("extension.dailyGoalLabel") || "Daily Capture"}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  {...register("dailyGoal")}
                />
                {errors.dailyGoal && <p className="text-sm text-destructive">{errors.dailyGoal.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {t("extension.dailyGoalDesc") || "Words to save via extension."}
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-success" />
                  {t("extension.dailyNewCardLimitLabel") || "New Cards / Day"}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  {...register("dailyNewCardLimit")}
                />
                {errors.dailyNewCardLimit && <p className="text-sm text-destructive">{errors.dailyNewCardLimit.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {t("extension.dailyNewCardLimitDesc") || "New flashcards to learn."}
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  {t("extension.dailyReviewLimitLabel") || "Review Limit / Day"}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={2000}
                  {...register("dailyReviewLimit")}
                />
                {errors.dailyReviewLimit && <p className="text-sm text-destructive">{errors.dailyReviewLimit.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {t("extension.dailyReviewLimitDesc") || "Max cards to review."}
                </p>
              </div>
            </div>

            {/* Languages */}
            <div className="grid gap-6 md:grid-cols-2 border-b pb-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-success" />
                  {t("extension.learningLanguageLabel") || "Learning Language"}
                </label>
                <Select
                  value={targetLanguage}
                  onValueChange={async (val) => {
                    setValue("targetLanguage", val, { shouldDirty: true });
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
                <p className="text-xs text-muted-foreground">
                  {t("extension.learningLanguageDesc") ||
                    "The language you are studying (e.g., English)."}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-info" />
                  {t("extension.nativeLanguageLabel") || "Native Language"}
                </label>
                <Select
                  value={nativeLanguage}
                  onValueChange={async (val) => {
                    setValue("nativeLanguage", val, { shouldDirty: true });
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
                <p className="text-xs text-muted-foreground">
                  {t("extension.nativeLanguageDesc") ||
                    "The language used for UI texts and explanations."}
                </p>
              </div>
            </div>

            {/* Default Translator */}
            <div className="space-y-3 pb-6 border-b">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warning" />
                {t("extension.defaultTranslatorLabel") || "Default Translation Provider"}
              </label>
              <div className="w-full md:w-[250px]">
                <QuickModelSwitcher
                  provider={defaultTranslator}
                  setProvider={async (val) => {
                    setValue("defaultTranslator", val, { shouldDirty: true });
                    await syncSettingField({ defaultTranslator: val });
                  }}
                  hideTrigger={true}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("extension.defaultTranslatorDesc") ||
                  "Select the underlying AI or model that powers real-time translation and Smart Bubble."}
              </p>
            </div>

            {/* Custom LLM Manager */}
            <div className="pb-6 border-b">
              <CustomLlmManager
                customLlmsJson={customLlmsJson}
                onChange={(val) => setValue("customLlmsJson", val, { shouldDirty: true })}
              />
            </div>

            {/* Excluded Domains */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-warning" />
                {t("extension.excludedDomainsLabel")}
              </label>
              <Textarea
                placeholder={t("extension.excludedDomainsPlaceholder")}
                rows={4}
                {...register("excludedDomains")}
                className="font-mono text-sm"
                disabled={!isHighlightEnabled}
              />
              <p className="text-xs text-muted-foreground">
                {t("extension.excludedDomainsDesc")}
              </p>
            </div>

            {/* Advanced JSON */}
            <div className="space-y-3 pt-4 border-t">
              <label className="text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                {t("extension.advancedLabel")}
              </label>
              <Textarea
                placeholder="{}"
                rows={6}
                {...register("preferencesJson")}
                className="font-mono text-sm bg-muted/50"
              />
              {errors.preferencesJson && <p className="text-sm text-destructive">{errors.preferencesJson.message as string}</p>}
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
  );
}
