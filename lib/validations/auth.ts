import * as z from "zod";

export const getLoginSchema = (t: (key: string) => string) => z.object({
  email: z.email({ message: t("errors.invalidEmail") }),
  password: z.string().min(6, { message: t("errors.shortPassword") }),
});

export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;

export const getRegisterSchema = (t: (key: string) => string) => z.object({
  fullName: z.string().min(2, { message: t("errors.shortName") }),
  email: z.email({ message: t("errors.invalidEmail") }),
  password: z.string().min(6, { message: t("errors.shortPassword") }),
});

export type RegisterInput = z.infer<ReturnType<typeof getRegisterSchema>>;

export const getForgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.email({ message: t("errors.invalidEmail") }),
});

export type ForgotPasswordInput = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export const getResetPasswordSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(6, { message: t("errors.shortPassword") }),
});

export type ResetPasswordInput = z.infer<ReturnType<typeof getResetPasswordSchema>>;
