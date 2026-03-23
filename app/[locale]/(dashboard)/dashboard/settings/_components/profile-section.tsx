"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { locales, languageNames } from "@/lib/i18n";

interface ProfileSectionProps {
  t: (key: string) => string;
  locale: string;
  user: { fullName?: string; email?: string; role?: string; avatarUrl?: string | null } | null;
  isUpdatingProfile: boolean;
  onUpdateProfile: (name: string, avatarUrl: string | null) => void;
}

export function ProfileSection({
  t,
  locale,
  user,
  isUpdatingProfile,
  onUpdateProfile,
}: ProfileSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileName, setProfileName] = useState(user?.fullName || "");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(user?.avatarUrl || null);

  const hasChanges =
    profileName !== user?.fullName || profileAvatarUrl !== (user?.avatarUrl || null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-5 mb-6">
            <Avatar className="h-24 w-24 ring-2 ring-offset-4 ring-offset-background ring-primary/20 transition-all duration-300 hover:ring-primary/50 shadow-md">
              {profileAvatarUrl && (
                <AvatarImage
                  src={profileAvatarUrl}
                  alt={user?.fullName || "User Avatar"}
                  className="object-cover transition-opacity duration-300"
                />
              )}
              <AvatarFallback className="bg-primary/5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2.5">
              <div>
                <h3 className="font-semibold text-xl tracking-tight leading-none mb-1.5">
                  {user?.fullName}
                </h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  {user?.role} Account
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit hover:bg-primary/10 transition-colors shadow-sm"
                onClick={() => {
                  const seed = Math.random().toString(36).substring(7);
                  setProfileAvatarUrl(`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`);
                }}
              >
                <span className="mr-2 text-base">🎲</span>{" "}
                {t("profile.randomizeAvatar") || "Randomize Avatar"}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profile.name")}</label>
              <div className="flex gap-2">
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onUpdateProfile(profileName, profileAvatarUrl)}
                  disabled={isUpdatingProfile || !hasChanges || !profileName.trim()}
                >
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("profile.updateButton")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profile.email")}</label>
              <Input defaultValue={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-3 md:col-span-2 pt-4 border-t mt-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {t("profile.languageLabel")}
              </label>
              <Select
                value={locale}
                onValueChange={(newLocale) => {
                  const segments = pathname.split("/");
                  segments[1] = newLocale;
                  router.push(segments.join("/"));
                }}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder={t("profile.languagePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((l) => (
                    <SelectItem key={l} value={l}>
                      {languageNames[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
