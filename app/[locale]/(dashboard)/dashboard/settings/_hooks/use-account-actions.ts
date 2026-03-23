import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";

interface UseAccountActionsProps {
  t: (key: string) => string;
  tErrors: (key: string) => string;
  locale: string;
  logout: () => void;
}

export function useAccountActions({ t, tErrors, locale, logout }: UseAccountActionsProps) {
  const router = useRouter();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleDeleteAccount = async () => {
    const res = await authApi.deleteAccount();
    if (res.success) {
      toast.success(t("account.deleteSuccess"));
      logout();
      router.push(`/${locale}/auth/login`);
    } else {
      showErrorToast(res, t("account.deleteFailed"), tErrors);
    }
    setConfirmDeleteOpen(false);
  };

  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    try {
      const res = await authApi.revokeAllSessions();
      if (res.success) {
        toast.success(t("account.revokeSuccess"));
        logout();
        router.push(`/${locale}/auth/login`);
      } else {
        showErrorToast(res, t("account.revokeFailed"), tErrors);
      }
    } finally {
      setIsRevoking(false);
      setConfirmRevokeOpen(false);
    }
  };

  return {
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    confirmRevokeOpen,
    setConfirmRevokeOpen,
    isRevoking,
    handleDeleteAccount,
    handleRevokeAllSessions,
  };
}
