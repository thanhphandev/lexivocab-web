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
    LoginRequest,
    RegisterRequest,

    UpdateProfileRequest,
    ChangePasswordRequest,
    UserProfile,
    MasterVocabularyDto,
    CreateMasterVocabularyRequest,
    CreateMasterVocabularyBatchCommand,
    UpdateMasterVocabularyRequest,
    SystemDiagnosticsDto,
    FeatureDefinitionDto,
    CreateFeatureDefinitionRequest,
    UpdateFeatureDefinitionRequest,
    PlanDefinitionDto,
    CreatePlanDefinitionRequest,
    UpdatePlanDefinitionRequest,
    BillingOverviewDto,
    PaymentHistoryDto,
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    CapturePaymentOrderRequest,
    PaymentStatusDto,
    SubscriptionPlanDto,
    StreakDetailsDto,
    VocabularyInDepthStatsDto,
    ReviewSessionDto,
    SubmitReviewRequest,
    ReviewResultDto,
    ReviewHistoryDto,
    UpdateSettingsRequest,
    UserSettingsDto,


    VocabularyDto,
    CreateVocabularyRequest,
    UpdateVocabularyRequest,
    BatchImportRequest,
    ExportResult,

    // NEW DTOs for 100% parity
    GoogleLoginRequest,
    AuthResponse,
    AuthUser,
    UserPermissionsDto,
    DashboardDto,
    HeatmapDataDto,


    // AI DTOs

    WordExplanationDto,
    AiExplainRequest,
    RelatedWordsDto,
    QuizDto,

    // Admin & Coupons
    AdminCouponDto,
    CreateCouponRequest,
    UpdateCouponRequest,
    AdvancedSystemStatsDto,
    ChartDataPoint
} from './types';


export const authApi = {
    forgotPassword: (data: ForgotPasswordRequest) =>
        clientApi.post<void>('/api/auth/forgot-password', data),
    resetPassword: (data: ResetPasswordRequest) =>
        clientApi.post<void>('/api/auth/reset-password', data),
    verifyEmail: (email: string, data: VerifyEmailRequest) =>
        clientApi.post<void>(`/api/auth/verify-email?email=${encodeURIComponent(email)}`, data),
    resendVerificationEmail: (data: ForgotPasswordRequest) =>
        clientApi.post<void>('/api/auth/resend-verification', data),


    // Auth-Management (Requires specialized routes for cookie setting/clearing)
    login: (data: LoginRequest) =>
        clientApi.post<AuthUser>('/api/auth/login', data),
    register: (data: RegisterRequest) =>
        clientApi.post<AuthUser & { requiresVerification?: boolean }>('/api/auth/register', data),
    logout: () =>
        clientApi.post<void>('/api/auth/logout'),
    getMe: () =>
        clientApi.get<UserProfile>('/api/auth/me'),
    refresh: () =>
        clientApi.post<void>('/api/auth/refresh'),

    updateProfile: (data: UpdateProfileRequest) =>
        clientApi.put<UserProfile>('/api/proxy/auth/me', data),
    changePassword: (data: ChangePasswordRequest) =>
        clientApi.put<void>('/api/proxy/auth/me/password', data),
    deleteAccount: () =>
        clientApi.delete<void>('/api/proxy/auth/me'),
    googleLogin: (data: GoogleLoginRequest) =>
        clientApi.post<AuthUser>('/api/auth/google', data),
    getPermissions: () =>
        clientApi.get<UserPermissionsDto>('/api/proxy/auth/permissions'),
    revokeAllSessions: () =>
        clientApi.post<void>('/api/proxy/auth/revoke-all-sessions'),
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
    getAdvancedMetrics: () =>
        clientApi.get<AdvancedSystemStatsDto>(`/api/proxy/admin/metrics/advanced`),
    coupons: {
        getList: (page = 1, pageSize = 20, search?: string) => {
            const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
            if (search) query.append('search', search);
            return clientApi.get<PagedResult<AdminCouponDto>>(`/api/proxy/admin/coupons?${query.toString()}`);
        },
        create: (data: CreateCouponRequest) =>
            clientApi.post<AdminCouponDto>(`/api/proxy/admin/coupons`, data),
        update: (id: string, data: UpdateCouponRequest) =>
            clientApi.put<AdminCouponDto>(`/api/proxy/admin/coupons/${id}`, data),
        delete: (id: string) =>
            clientApi.delete<void>(`/api/proxy/admin/coupons/${id}`),
    },
    getAuditLogs: (page = 1, pageSize = 20, filters?: { userId?: string, action?: string, entityType?: string, search?: string, fromDate?: string, toDate?: string }) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (filters?.userId) query.append('userId', filters.userId);
        if (filters?.action) query.append('action', filters.action);
        if (filters?.entityType) query.append('entityType', filters.entityType);
        if (filters?.search) query.append('search', filters.search);
        if (filters?.fromDate) query.append('fromDate', filters.fromDate);
        if (filters?.toDate) query.append('toDate', filters.toDate);
        return clientApi.get<PagedResult<AuditLogDto>>(`/api/proxy/admin/audit-logs?${query.toString()}`);
    },

    // SaaS Features
    getFeatures: () => clientApi.get<FeatureDefinitionDto[]>(`/api/proxy/admin/features/definitions`),
    createFeature: (data: CreateFeatureDefinitionRequest) => clientApi.post<FeatureDefinitionDto>(`/api/proxy/admin/features/definitions`, data),
    updateFeature: (id: string, data: UpdateFeatureDefinitionRequest) => clientApi.put<FeatureDefinitionDto>(`/api/proxy/admin/features/definitions/${id}`, data),
    deleteFeature: (id: string) => clientApi.delete<void>(`/api/proxy/admin/features/definitions/${id}`),
    getFeatureDetail: (id: string) => clientApi.get<FeatureDefinitionDto>(`/api/proxy/admin/features/definitions/${id}`),


    // SaaS Plans
    getPlans: () => clientApi.get<PlanDefinitionDto[]>(`/api/proxy/admin/plans/definitions`),
    createPlan: (data: CreatePlanDefinitionRequest) => clientApi.post<PlanDefinitionDto>(`/api/proxy/admin/plans/definitions`, data),
    updatePlan: (id: string, data: UpdatePlanDefinitionRequest) => clientApi.put<PlanDefinitionDto>(`/api/proxy/admin/plans/definitions/${id}`, data),
    deletePlan: (id: string) => clientApi.delete<void>(`/api/proxy/admin/plans/definitions/${id}`),
    getPlanDetail: (id: string) => clientApi.get<PlanDefinitionDto>(`/api/proxy/admin/plans/definitions/${id}`),


    // Master Vocabularies
    getMasterVocabularies: (page = 1, pageSize = 20, search?: string, isApproved?: boolean) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (search) query.append('search', search);
        if (isApproved !== undefined) query.append('isApproved', isApproved.toString());
        return clientApi.get<PagedResult<MasterVocabularyDto>>(`/api/proxy/admin/vocabularies/master?${query.toString()}`);
    },
    createMasterVocabulary: (data: CreateMasterVocabularyRequest) => clientApi.post<MasterVocabularyDto>(`/api/proxy/admin/vocabularies/master`, data),
    createMasterVocabularyBatch: (data: CreateMasterVocabularyBatchCommand) => clientApi.post<{ success: boolean; createdCount: number }>(`/api/proxy/admin/vocabularies/master/batch`, data),
    lookupMasterVocabulary: (word: string) => clientApi.get<MasterVocabularyDto>(`/api/proxy/admin/vocabularies/master/lookup?word=${encodeURIComponent(word)}`),
    updateMasterVocabulary: (id: string, data: UpdateMasterVocabularyRequest) => clientApi.put<MasterVocabularyDto>(`/api/proxy/admin/vocabularies/master/${id}`, data),
    approveMasterVocabulary: (id: string, data?: UpdateMasterVocabularyRequest) => clientApi.patch<void>(`/api/proxy/admin/vocabularies/master/${id}/approve`, { id, ...data }),
    deleteMasterVocabulary: (id: string) => clientApi.delete<void>(`/api/proxy/admin/vocabularies/master/${id}`),
    getMasterVocabularyDetail: (id: string) => clientApi.get<MasterVocabularyDto>(`/api/proxy/admin/vocabularies/master/${id}`),
};


export const diagnosticsApi = {
    getSystemInfo: () => clientApi.get<SystemDiagnosticsDto>(`/api/proxy/diagnostics/system-info`)
};

export const paymentApi = {
    getPlans: () => clientApi.get<SubscriptionPlanDto[]>("/api/proxy/payments/plans"),
    getBillingOverview: () => clientApi.get<BillingOverviewDto>("/api/proxy/payments/billing"),
    getPaymentHistory: (page = 1, pageSize = 20) =>
        clientApi.get<PagedResult<PaymentHistoryDto>>(`/api/proxy/payments/history?page=${page}&pageSize=${pageSize}`),
    createOrder: (data: CreatePaymentOrderRequest) =>
        clientApi.post<CreatePaymentOrderResponse>("/api/proxy/payments/create-order", data),
    captureOrder: (data: CapturePaymentOrderRequest) =>
        clientApi.post<{ message: string }>("/api/proxy/payments/capture-order", data),
    checkStatus: (token: string) =>
        clientApi.get<PaymentStatusDto>(`/api/proxy/payments/status/${token}`),
    cancelPayment: (reference: string) =>
        clientApi.post<void>(`/api/proxy/payments/cancel/${reference}`),
    cancelSubscription: () =>
        clientApi.post<void>('/api/proxy/payments/cancel-subscription'),
    getInvoiceUrl: (id: string) =>
        `/api/proxy/payments/invoice/${id}`,
    validateCoupon: (code: string) =>
        clientApi.get<{ code: string; discountType: number; discountValue: number }>(`/api/proxy/coupons/validate?code=${encodeURIComponent(code)}`),
};


export const tagsApi = {
    getList: () => clientApi.get<TagDto[]>('/api/proxy/tags'),
    create: (data: CreateTagRequest) => clientApi.post<TagDto>('/api/proxy/tags', data),
    update: (id: string, data: UpdateTagRequest) => clientApi.put<TagDto>(`/api/proxy/tags/${id}`, data),
    delete: (id: string) => clientApi.delete<void>(`/api/proxy/tags/${id}`),
    getVocabularies: (id: string, page = 1, pageSize = 20) =>
        clientApi.get<PagedResult<VocabularyDto>>(`/api/proxy/tags/${id}/vocabularies?page=${page}&pageSize=${pageSize}`),
    assign: (id: string, vocabularyId: string) =>
        clientApi.patch<void>(`/api/proxy/tags/${id}/assign`, vocabularyId),
};

export const reviewsApi = {
    getSession: (limit = 50) =>
        clientApi.get<ReviewSessionDto>(`/api/proxy/reviews/session?limit=${limit}`),
    submitReview: (data: SubmitReviewRequest) =>
        clientApi.post<ReviewResultDto>('/api/proxy/reviews', data),
    getHistory: (page = 1, pageSize = 20) =>
        clientApi.get<PagedResult<ReviewHistoryDto>>(`/api/proxy/reviews/history?page=${page}&pageSize=${pageSize}`),
};

export const settingsApi = {
    get: () => clientApi.get<UserSettingsDto>('/api/proxy/settings'),
    update: (data: UpdateSettingsRequest) => clientApi.put<UserSettingsDto>('/api/proxy/settings', data),
    testNotifications: (data: { nativeLanguage: string, isTelegramReminderEnabled: boolean, telegramBotToken: string, telegramChatId: string, isZaloReminderEnabled: boolean, zaloBotToken: string, zaloUserId: string }) => clientApi.post<boolean>('/api/proxy/settings/test-bot-notifications', data),
};

export const masterVocabApi = {
    lookup: (word: string) =>
        clientApi.get<MasterVocabularyDto>(`/api/proxy/master-vocab/lookup?word=${encodeURIComponent(word)}`),
    search: (q: string, limit = 10) =>
        clientApi.get<MasterVocabularyDto[]>(`/api/proxy/master-vocab/search?q=${encodeURIComponent(q)}&limit=${limit}`),
};

export const vocabularyApi = {
    getList: (page = 1, pageSize = 20, isArchived?: boolean, search?: string, tagId?: string) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (isArchived !== undefined) query.append('isArchived', isArchived.toString());
        if (search) query.append('search', search);
        if (tagId) query.append('tagId', tagId);
        return clientApi.get<PagedResult<VocabularyDto>>(`/api/proxy/vocabularies?${query.toString()}`);
    },
    getExploreList: (page = 1, pageSize = 20, search?: string) => {
        const query = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (search) query.append('search', search);
        return clientApi.get<PagedResult<MasterVocabularyDto>>(`/api/proxy/vocabularies/explore?${query.toString()}`);
    },
    getById: (id: string) => clientApi.get<VocabularyDto>(`/api/proxy/vocabularies/${id}`),
    create: (data: CreateVocabularyRequest) => clientApi.post<VocabularyDto>('/api/proxy/vocabularies', data),
    update: (id: string, data: UpdateVocabularyRequest) => clientApi.put<VocabularyDto>(`/api/proxy/vocabularies/${id}`, data),
    updateTag: (id: string, tagId: string | null) =>
        clientApi.patch<void>(`/api/proxy/vocabularies/${id}/tag`, { tagId }),
    archive: (id: string) => clientApi.patch<void>(`/api/proxy/vocabularies/${id}/archive`, {}),
    contributeToMasterVocabulary: (id: string) =>
        clientApi.post<void>(`/api/proxy/vocabularies/${id}/contribute`, {}),
    delete: (id: string) => clientApi.delete<void>(`/api/proxy/vocabularies/${id}`),
    batchImport: (data: BatchImportRequest) => clientApi.post<number>('/api/proxy/vocabularies/batch', data),
    export: (format = 'json') => `/api/proxy/vocabularies/export?format=${format}`,
};

export const analyticsApi = {
    getStreak: () =>
        clientApi.get<StreakDetailsDto>("/api/proxy/analytics/streak"),
    getStats: () =>
        clientApi.get<VocabularyInDepthStatsDto>("/api/proxy/vocabularies/stats"),
    getDashboard: () =>
        clientApi.get<DashboardDto>("/api/proxy/analytics/dashboard"),
    getHeatmap: (year?: number) =>
        clientApi.get<HeatmapDataDto>(`/api/proxy/analytics/heatmap${year ? `?year=${year}` : ''}`),
};

export const aiApi = {
    explain: (data: AiExplainRequest, provider?: string, modelId?: string) => {
        let url = '/api/proxy/ai/explain';
        const params = new URLSearchParams();
        if (provider) params.append('provider', provider);
        if (modelId) params.append('modelId', modelId);
        if (params.toString()) url += `?${params.toString()}`;
        return clientApi.post<WordExplanationDto>(url, data);
    },
    getRelated: (word: string, provider?: string, modelId?: string) => {
        let url = `/api/proxy/ai/related/${encodeURIComponent(word)}`;
        const params = new URLSearchParams();
        if (provider) params.append('provider', provider);
        if (modelId) params.append('modelId', modelId);
        if (params.toString()) url += `?${params.toString()}`;
        return clientApi.get<RelatedWordsDto>(url);
    },
    getQuiz: (word: string, provider?: string, modelId?: string) => {
        let url = `/api/proxy/ai/quiz/${encodeURIComponent(word)}`;
        const params = new URLSearchParams();
        if (provider) params.append('provider', provider);
        if (modelId) params.append('modelId', modelId);
        if (params.toString()) url += `?${params.toString()}`;
        return clientApi.get<QuizDto>(url);
    },

    translate: async (
        word: string,
        context?: string,
        provider?: string,
        modelId?: string,
        from?: string,
        to?: string,
        customParams?: { customBaseUrl?: string, customApiKey?: string, customModel?: string }
    ) => {
        const query = new URLSearchParams({ word });
        if (context) query.append('context', context);
        if (provider) query.append('provider', provider);
        if (modelId) query.append('modelId', modelId);
        if (from) query.append('from', from);
        if (to) query.append('to', to);
        if (customParams?.customBaseUrl) query.append('customBaseUrl', customParams.customBaseUrl);
        if (customParams?.customApiKey) query.append('customApiKey', customParams.customApiKey);
        if (customParams?.customModel) query.append('customModel', customParams.customModel);

        const res = await fetch(`/api/proxy/ai/translate?${query.toString()}`);
        if (!res.ok) {
            let errorBody;
            try { errorBody = await res.json(); } catch { }
            throw { status: res.status, message: errorBody?.error || "Translation failed" };
        }
        return await res.json();
    },

    streamTranslation: async function* (
        word: string,
        context?: string,
        provider?: string,
        modelId?: string,
        from?: string,
        to?: string,
        customParams?: { customBaseUrl?: string, customApiKey?: string, customModel?: string }
    ) {
        const query = new URLSearchParams({ word });
        if (context) query.append('context', context);
        if (provider) query.append('provider', provider);
        if (modelId) query.append('modelId', modelId);
        if (from) query.append('from', from);
        if (to) query.append('to', to);
        if (customParams?.customBaseUrl) query.append('customBaseUrl', customParams.customBaseUrl);
        if (customParams?.customApiKey) query.append('customApiKey', customParams.customApiKey);
        if (customParams?.customModel) query.append('customModel', customParams.customModel);

        const res = await fetch(`/api/proxy/ai/translate-stream?${query.toString()}`);

        if (!res.ok) {
            let errorBody;
            try { errorBody = await res.json(); } catch { }
            throw { status: res.status, message: errorBody?.error || "Streaming translation failed" };
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No readable stream available");

        let done = false;
        let buffer = "";

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                buffer += decoder.decode(value, { stream: !done });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') continue;
                        if (!dataStr) continue;

                        try {
                            const parsed = JSON.parse(dataStr);
                            yield parsed;
                        } catch (e) {
                            console.error("Error parsing SSE JSON:", e, dataStr);
                        }
                    }
                }
            }
        }
    },
};



