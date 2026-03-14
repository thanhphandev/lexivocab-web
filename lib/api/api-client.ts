/**
 * API Client for LexiVocab Web Dashboard
 *
 * - Server-side: calls API directly with JWT from cookies
 * - Client-side: calls Next.js proxy routes (/api/proxy/*)
 */

import type { ApiResponse } from "./types";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Server-side fetch helpers — read token from cookies */
export async function serverFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            cache: "no-store",
        });

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            return {
                success: false,
                error: body?.error || body?.title || `Request failed (${res.status})`,
            };
        }

        // Some endpoints return 204 No Content
        if (res.status === 204) {
            return { success: true, data: null as T };
        }

        const data = await res.json();
        // Backend wraps in { success, data } or { success, error }
        if (typeof data?.success === "boolean") {
            return data as ApiResponse<T>;
        }
        // If backend returns raw data (e.g. from older endpoints)
        return { success: true, data: data as T };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Network error",
        };
    }
}

/** Client-side API class — calls our Next.js proxy routes */
class ClientApi {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        try {
            const res = await fetch(endpoint, {
                ...options,
                headers,
                credentials: "include", // send cookies
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                return {
                    success: false,
                    error: body?.error || `Request failed (${res.status})`,
                };
            }

            if (res.status === 204) {
                return { success: true, data: null as T };
            }

            const data = await res.json();
            if (typeof data?.success === "boolean") {
                return data as ApiResponse<T>;
            }
            return { success: true, data: data as T };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Network error",
            };
        }
    }

    get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: "GET" });
    }

    post<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    put<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    patch<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

export const clientApi = new ClientApi();

/** Convenience wrappers for Admin specific endpoints */
import type {
    UserOverviewDto,
    UserDetailDto,
    SystemStatsDto,
    PagedResult,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    AddSubscriptionRequest,
    AuditLogDto,
    TagDto,
    CreateTagRequest,
    UpdateTagRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserProfile
} from './types';

export const authApi = {
    forgotPassword: (data: ForgotPasswordRequest) =>
        clientApi.post<void>('/api/proxy/auth/forgot-password', data),
    resetPassword: (data: ResetPasswordRequest) =>
        clientApi.post<void>('/api/proxy/auth/reset-password', data),
    verifyEmail: (email: string, data: VerifyEmailRequest) =>
        clientApi.post<void>(`/api/proxy/auth/verify-email?email=${encodeURIComponent(email)}`, data),
    resendVerificationEmail: (data: ForgotPasswordRequest) => // Shares the same DTO signature
        clientApi.post<void>('/api/proxy/auth/resend-verification-email', data),
    updateProfile: (data: UpdateProfileRequest) =>
        clientApi.put<UserProfile>('/api/proxy/auth/me', data),
    changePassword: (data: ChangePasswordRequest) =>
        clientApi.put<void>('/api/proxy/auth/me/password', data),
    deleteAccount: () =>
        clientApi.delete<void>('/api/proxy/auth/me'),
};

export const adminApi = {
    getUsers: (page = 1, pageSize = 20, search?: string) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (search) query.append('search', search);
        return clientApi.get<PagedResult<UserOverviewDto>>(`/api/proxy/admin/users?${query.toString()}`);
    },
    getUserDetail: (id: string) =>
        clientApi.get<UserDetailDto>(`/api/proxy/admin/users/${id}`),
    updateRoles: (id: string, data: UpdateUserRoleRequest) =>
        clientApi.put<string>(`/api/proxy/admin/users/${id}/role`, data),
    updateStatus: (id: string, data: UpdateUserStatusRequest) =>
        clientApi.put<string>(`/api/proxy/admin/users/${id}/status`, data),
    addSubscription: (id: string, data: AddSubscriptionRequest) =>
        clientApi.post<string>(`/api/proxy/admin/users/${id}/subscriptions`, data),
    cancelSubscription: (id: string) =>
        clientApi.delete<string>(`/api/proxy/admin/users/${id}/subscriptions`),
    getMetrics: () =>
        clientApi.get<SystemStatsDto>(`/api/proxy/admin/metrics`),
    getAuditLogs: (page = 1, pageSize = 20, search?: string) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (search) query.append('search', search);
        return clientApi.get<PagedResult<AuditLogDto>>(`/api/proxy/admin/audit-logs?${query.toString()}`);
    },
};

export const tagsApi = {
    getList: () => clientApi.get<TagDto[]>('/api/proxy/tags'),
    create: (data: CreateTagRequest) => clientApi.post<TagDto>('/api/proxy/tags', data),
    update: (id: string, data: UpdateTagRequest) => clientApi.put<TagDto>(`/api/proxy/tags/${id}`, data),
    delete: (id: string) => clientApi.delete<void>(`/api/proxy/tags/${id}`),
};

export const vocabularyApi = {
    updateTag: (id: string, tagId: string | null) =>
        clientApi.patch<void>(`/api/proxy/vocabularies/${id}/tag`, { tagId }),
};
