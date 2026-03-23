"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DangerZoneSectionProps {
  t: (key: string) => string;
  isRevoking: boolean;
  onLogout: () => void;
  onRevokeAllSessions: () => void;
  onDeleteAccount: () => void;
}

export function DangerZoneSection({
  t,
  isRevoking,
  onLogout,
  onRevokeAllSessions,
  onDeleteAccount,
}: DangerZoneSectionProps) {
  return (
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
          <Button variant="outline" type="button" onClick={onLogout}>
            {t("account.logOut")}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onRevokeAllSessions}
            className="text-orange-600 hover:bg-orange-50 border-orange-200"
            disabled={isRevoking}
          >
            {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("account.revokeAllSessions")}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={onDeleteAccount}
            className="text-destructive hover:bg-destructive/10"
          >
            {t("account.deleteAccount")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
