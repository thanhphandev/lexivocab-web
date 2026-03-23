import { useState } from "react";
import { toast } from "sonner";

interface UseProfileActionsProps {
  t: (key: string) => string;
  updateProfile: (data: { fullName: string; avatarUrl?: string }) => Promise<boolean>;
}

export function useProfileActions({ t, updateProfile }: UseProfileActionsProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async (profileName: string, profileAvatarUrl: string | null) => {
    if (!profileName.trim()) return;
    setIsUpdatingProfile(true);
    const success = await updateProfile({
      fullName: profileName,
      avatarUrl: profileAvatarUrl ?? undefined,
    });
    if (success) {
      toast.success(t("password.profileUpdated"));
    } else {
      toast.error(t("password.profileFailed"));
    }
    setIsUpdatingProfile(false);
  };

  return { isUpdatingProfile, handleUpdateProfile };
}
