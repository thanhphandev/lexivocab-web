"use client";

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { clientApi, authApi } from "@/lib/api/api-client";
import type {
    UserPermissionsDto,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest
} from "@/lib/api/types";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    permissions: UserPermissionsDto | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    errorCode: string | null;
    login: (data: LoginRequest) => Promise<boolean>;
    register: (data: RegisterRequest) => Promise<boolean>;
    googleLogin: (idToken: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<boolean>;
    refreshPermissions: () => Promise<void>;
    updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [permissions, setPermissions] = useState<UserPermissionsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const t = useTranslations("errors");

    // Helper to extract translation from API result
    const handleError = (result: any, defaultMsg: string) => {
        if ("error" in result) {
            const code = result.errorCode;
            setErrorCode(code || null);
            if (code) {
                // Return translated error, or fallback to server error if next-intl returns the key itself
                const translated = t(code as any);
                setError(translated !== code ? translated : (result.error as string) || defaultMsg);
            } else {
                setError((result.error as string) || defaultMsg);
            }
        } else {
            setErrorCode(null);
            setError(defaultMsg);
        }
    };

    const refreshPermissions = useCallback(async () => {
        try {
            const res = await clientApi.get<UserPermissionsDto>("/api/proxy/auth/permissions");
            if (res.success) setPermissions(res.data);
        } catch { /* non-critical */ }
    }, []);

    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            const res = await authApi.refresh();
            if (!res.success) {
                localStorage.removeItem("lexivocab_auth_hint");
                return false;
            }

            const result = await authApi.getMe();
            if (result.success && result.data) {
                setUser({
                    id: result.data.id,
                    email: result.data.email,
                    fullName: result.data.fullName,
                    role: result.data.role,
                    avatarUrl: (result.data as any).avatarUrl || (result.data as any).AvatarUrl,
                });
                localStorage.setItem("lexivocab_auth_hint", "true");
                refreshPermissions();
                return true;
            }
            localStorage.removeItem("lexivocab_auth_hint");
            return false;
        } catch {
            localStorage.removeItem("lexivocab_auth_hint");
            return false;
        }
    }, [refreshPermissions]);

    useEffect(() => {
        const initAuth = async () => {
            const hasAuthHint = localStorage.getItem("lexivocab_auth_hint") === "true";
            if (!hasAuthHint) {
                setIsLoading(false);
                return;
            }

            try {
                const result = await authApi.getMe();
                if (result.success && result.data) {
                    setUser({
                        id: result.data.id,
                        email: result.data.email,
                        fullName: result.data.fullName,
                        role: result.data.role,
                        avatarUrl: (result.data as any).avatarUrl || (result.data as any).AvatarUrl,
                    });
                    refreshPermissions();
                } else {
                    await refreshSession();
                }
            } catch {
                await refreshSession();
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, [refreshSession, refreshPermissions]);

    const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.login(data);
            if (result.success && result.data) {
                setUser({
                    id: result.data.id,
                    email: result.data.email,
                    fullName: result.data.fullName,
                    role: result.data.role,
                    avatarUrl: (result.data as any).avatarUrl || (result.data as any).AvatarUrl,
                });
                localStorage.setItem("lexivocab_auth_hint", "true");
                refreshPermissions();
                return true;
            }
            handleError(result, t("GENERIC_ERROR"));
            return false;
        } catch {
            setError(t("GENERIC_ERROR"));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refreshPermissions]);

    const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.register(data);
            if (result.success) {
                // Thường sau khi register thành công ta sẽ login luôn hoặc redirect
                return true;
            }
            handleError(result, t("GENERIC_ERROR"));
            return false;
        } catch {
            setError(t("GENERIC_ERROR"));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const googleLogin = useCallback(async (idToken: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.googleLogin({ idToken });
            if (result.success && result.data) {
                setUser({
                    id: result.data.id,
                    email: result.data.email,
                    fullName: result.data.fullName,
                    role: result.data.role,
                    avatarUrl: (result.data as any).avatarUrl || (result.data as any).AvatarUrl,
                });
                localStorage.setItem("lexivocab_auth_hint", "true");
                refreshPermissions();
                return true;
            }
            handleError(result, t("AUTH_GOOGLE_TOKEN_INVALID"));
            return false;
        } catch {
            setError(t("AUTH_GOOGLE_TOKEN_INVALID"));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refreshPermissions]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setPermissions(null);
            localStorage.removeItem("lexivocab_auth_hint");
            const locale = pathname.split("/")[1] || "en";
            router.push(`/${locale}/auth/login`);
        }
    }, [pathname, router]);

    const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.updateProfile(data);
            if (result.success) {
                setUser(prev => prev ? {
                    ...prev,
                    fullName: result.data.fullName,
                    avatarUrl: (result.data as any).avatarUrl
                } : null);
                return true;
            }
            handleError(result, t("GENERIC_ERROR"));
            return false;
        } catch {
            setError(t("GENERIC_ERROR"));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setErrorCode(null);
    }, []);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthContext.Provider
                value={{
                    user,
                    permissions,
                    isAuthenticated: !!user,
                    isLoading,
                    error,
                    errorCode,
                    login,
                    register,
                    googleLogin,
                    logout,
                    refreshSession,
                    refreshPermissions,
                    updateProfile,
                    clearError,
                }}
            >
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}