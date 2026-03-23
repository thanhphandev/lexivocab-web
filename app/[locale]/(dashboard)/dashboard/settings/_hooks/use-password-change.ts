import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/api-client";
import { showErrorToast, getErrorMessage } from "@/lib/error-handler";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, PasswordInput } from "@/lib/validations/settings";

interface UsePasswordChangeProps {
  t: (key: string) => string;
  tErrors: (key: string) => string;
  locale: string;
  logout: () => void;
}

export function usePasswordChange({ t, tErrors, locale, logout }: UsePasswordChangeProps) {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const form = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: PasswordInput) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword(data);
      if (res.success) {
        toast.success(t("password.successMsg"));
        setPasswordSuccess(t("password.successMsg"));
        form.reset();
        setTimeout(() => {
          logout();
          router.push(`/${locale}/auth/login`);
        }, 2000);
      } else {
        showErrorToast(res, t("password.failMsg"), tErrors);
        setPasswordError(getErrorMessage(res, tErrors, t("password.failMsg")));
      }
    } catch {
      toast.error(t("unexpectedError"));
      setPasswordError(t("unexpectedError"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return { form, onSubmit, isChangingPassword, passwordError, passwordSuccess };
}
