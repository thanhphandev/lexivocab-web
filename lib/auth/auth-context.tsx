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
import type { UserProfile, UserPermissionsDto, LoginRequest, RegisterRequest, UpdateProfileRequest } from "@/lib/api/types";
import { GoogleOAuthProvider } from '@react-oauth/google';

interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
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
    const [user, setUser] = useState<AuthUser | null>(null);
    const [permissions, setPermissions] = useState<UserPermissionsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /** Fetch user permissions (quotas, feature flags) */
    const refreshPermissions = useCallback(async () => {
        try {
            const res = await clientApi.get<UserPermissionsDto>("/api/proxy/auth/permissions");
            if (res.success) setPermissions(res.data);
        } catch { /* non-critical */ }
    }, []);

    /** Try to refresh the session via server-side refresh route */
    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });
            if (!refreshRes.ok) return false;

            // Re-fetch user profile
            const result = await clientApi.get<UserProfile>("/api/auth/me");
            if (result.success) {
                setUser({
                    id: result.data.id,
                    email: result.data.email,
                    fullName: result.data.fullName,
                    role: result.data.role,
                });
                refreshPermissions();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    // Hydrate user from cookie on mount
    useEffect(() => {
        (async () => {
            try {
                const result = await clientApi.get<UserProfile>("/api/auth/me");
                if (result.success) {
                    setUser({
                        id: result.data.id,
                        email: result.data.email,
                        fullName: result.data.fullName,
                        role: result.data.role,
                    });
                    refreshPermissions();
                } else {
                    // Try to refresh if /me fails (token might be expired)
                    await refreshSession();
                }
            } catch {
                // Not authenticated — try refresh
                await refreshSession();
            } finally {
                setIsLoading(false);
            }
        })();
    }, [refreshSession]);

    const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clientApi.post<AuthUser>("/api/auth/login", data);
            if (result.success) {
                setUser(result.data);
                refreshPermissions();
                return true;
            }
            setError("error" in result ? result.error : "Login failed");
            return false;
        } catch {
            setError("An unexpected error occurred");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clientApi.post<AuthUser>("/api/auth/register", data);
            if (result.success) {
                setUser(result.data);
                return true;
            }
            setError("error" in result ? result.error : "Registration failed");
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
            const result = await clientApi.post<AuthUser>("/api/auth/google", { idToken });
            if (result.success) {
                setUser(result.data);
                return true;
            }
            setError("error" in result ? result.error : "Google login failed");
            return false;
        } catch {
            setError("An unexpected error occurred");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await clientApi.post("/api/auth/logout");
        setUser(null);
        setPermissions(null);
    }, []);

    const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.updateProfile(data);
            if (result.success) {
                // Update the local user state with the new profile data
                setUser(prev => prev ? { ...prev, fullName: result.data.fullName } : null);
                return true;
            }
            setError("error" in result ? result.error : "Failed to update profile");
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
