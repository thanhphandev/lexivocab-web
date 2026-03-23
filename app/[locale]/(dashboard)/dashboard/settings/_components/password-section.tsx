"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { PasswordInput } from "@/lib/validations/settings";

interface PasswordSectionProps {
  t: (key: string) => string;
  form: UseFormReturn<PasswordInput>;
  onSubmit: (data: PasswordInput) => void;
  isChangingPassword: boolean;
  passwordError: string | null;
  passwordSuccess: string | null;
}

export function PasswordSection({
  t,
  form,
  onSubmit,
  isChangingPassword,
  passwordError,
  passwordSuccess,
}: PasswordSectionProps) {
  const { register, handleSubmit, formState: { errors, isValid } } = form;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {t("password.title")}
          </CardTitle>
          <CardDescription>{t("password.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                {t("password.currentLabel")}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("currentPassword")}
                disabled={isChangingPassword}
              />
              {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message as string}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                {t("password.newLabel")}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("newPassword")}
                disabled={isChangingPassword}
              />
              {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message as string}</p>}
            </div>
            {passwordError && (
              <p className="text-sm font-medium text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm font-medium text-success">{passwordSuccess}</p>
            )}
            <Button
              type="submit"
              disabled={isChangingPassword || !isValid}
              className="mt-2"
            >
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("password.submitButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
