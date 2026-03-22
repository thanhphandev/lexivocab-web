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

    const refreshPermissions = useCallback(async () => {
        try {
            const res = await clientApi.get<UserPermissionsDto>("/api/proxy/auth/permissions");
            if (res.success) setPermissions(res.data);
        } catch { /* non-critical */ }
    }, []);

    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            const res = await authApi.refresh();
            if (!res.success) return false;

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
                return true;
            }
            return false;
        } catch { return false; }
    }, [refreshPermissions]);

    useEffect(() => {
        const initAuth = async () => {
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
                refreshPermissions();
                return true;
            }
            setError("error" in result ? (result.error as string) : "Login failed");
            return false;
        } catch {
            setError("An unexpected error occurred");
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
            setError("error" in result ? (result.error as string) : "Registration failed");
            return false;
        } catch {
            setError("An unexpected error occurred");
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
                refreshPermissions();
                return true;
            }
            return false;
        } catch {
            setError("Google login failed");
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
            setError("error" in result ? (result.error as string) : "Update failed");
            return false;
        } catch {
            setError("An unexpected error occurred");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

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