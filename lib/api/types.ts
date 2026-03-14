/**
 * Shared TypeScript types mirroring all LexiVocab API DTOs.
 */

// ─── Generic API Response ────────────────────────────────────
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ─── Auth DTOs ───────────────────────────────────────────────
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface GoogleLoginRequest {
    idToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
}

export interface VerifyEmailRequest {
    code: string;
}

export interface UpdateProfileRequest {
    fullName: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLogin: string | null;
}

// ─── Vocabulary DTOs ─────────────────────────────────────────
export interface VocabularyDto {
    id: string;
    tagId: string | null;
    wordText: string;
    customMeaning: string | null;
    contextSentence: string | null;
    sourceUrl: string | null;
    repetitionCount: number;
    easinessFactor: number;
    intervalDays: number;
    nextReviewDate: string;
    lastReviewedAt: string | null;
    isArchived: boolean;
    createdAt: string;
    phoneticUk: string | null;
    phoneticUs: string | null;
    audioUrl: string | null;
    partOfSpeech: string | null;
}

export interface CreateVocabularyRequest {
    wordText: string;
    customMeaning?: string;
    contextSentence?: string;
    sourceUrl?: string;
}

export interface UpdateVocabularyRequest {
    customMeaning?: string;
    contextSentence?: string;
}

export interface VocabularyStatsDto {
    total: number;
    active: number;
    archived: number;
    dueToday: number;
}

// ─── Tag DTOs ───────────────────────────────────────────────
export interface TagDto {
    id: string;
    userId: string;
    name: string;
    icon: string | null;
    color: string | null;
    createdAt: string;
}

export interface CreateTagRequest {
    name: string;
    icon?: string;
    color?: string;
}

export interface UpdateTagRequest {
    name?: string;
    icon?: string;
    color?: string;
}

// ─── Review DTOs ─────────────────────────────────────────────
export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewSessionDto {
    cards: ReviewCardDto[];
    totalDue: number;
}

export interface ReviewCardDto {
    vocabularyId: string;
    wordText: string;
    customMeaning: string | null;
    contextSentence: string | null;
    phoneticUs: string | null;
    audioUrl: string | null;
    repetitionCount: number;
    easinessFactor: number;
}

export interface SubmitReviewRequest {
    userVocabularyId: string;
    qualityScore: QualityScore;
    timeSpentMs?: number;
}

export interface ReviewResultDto {
    vocabularyId: string;
    newRepetitionCount: number;
    newEasinessFactor: number;
    newIntervalDays: number;
    nextReviewDate: string;
}

export interface ReviewHistoryDto {
    id: string;
    userVocabularyId: string;
    wordText: string;
    qualityScore: QualityScore;
    timeSpentMs: number | null;
    reviewedAt: string;
}

// ─── Analytics DTOs ──────────────────────────────────────────
export interface DashboardDto {
    vocabulary: VocabularyOverviewDto;
    reviews: ReviewOverviewDto;
    currentStreak: number;
    totalStudyDays: number;
}

export interface VocabularyOverviewDto {
    totalWords: number;
    activeWords: number;
    masteredWords: number;
    dueToday: number;
}

export interface ReviewOverviewDto {
    totalReviewsToday: number;
    totalReviewsThisWeek: number;
    averageQualityScore: number;
}

export interface HeatmapDataDto {
    entries: HeatmapEntryDto[];
    year: number;
}

export interface HeatmapEntryDto {
    date: string;
    count: number;
}

export interface StreakDto {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
}

// ─── Settings DTOs ───────────────────────────────────────────
export interface UserSettingsDto {
    isHighlightEnabled: boolean;
    highlightColor: string;
    excludedDomains: string[];
    dailyGoal: number;
    preferencesJson?: string;
}

export interface UpdateSettingsRequest {
    isHighlightEnabled?: boolean;
    highlightColor?: string;
    excludedDomains?: string[];
    dailyGoal?: number;
    preferencesJson?: string;
}

// ─── Payment & Billing DTOs ─────────────────────────────────────
export interface SubscriptionDto {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string | null;
    provider: string;
    externalSubscriptionId: string | null;
}

export interface PaymentHistoryDto {
    id: string;
    provider: string;
    externalOrderId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    paidAt: string | null;
}

export interface BillingOverviewDto {
    activeSubscription: SubscriptionDto | null;
    featureFlags: Record<string, string>;
    plan: string;
    planExpiresAt: string | null;
    totalTransactions: number;
}

export interface UserPermissionsDto {
    plan: string;
    currentCount: number;
    planExpiresAt: string | null;
    featureFlags: Record<string, string>;
}

export interface CreatePaymentOrderRequest {
    planId: string;
    provider: number; // 1: PayPal, 3: Seapay
}

export interface CreatePaymentOrderResponse {
    approvalUrl: string;
}

export interface PlanFeatureDto {
    textKey: string;
    included: boolean;
}

export interface SubscriptionPlanDto {
    id: string;
    nameKey: string;
    price: string;
    intervalKey: string;
    descriptionKey: string;
    isRecommended: boolean;
    features: PlanFeatureDto[];
}

// ─── Admin DTOs ──────────────────────────────────────────────
export interface UserOverviewDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    authProvider: string | null;
}

export interface UserDetailDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    authProvider: string | null;
    totalVocabularies: number;
    totalReviews: number;
    planExpirationDate: string | null;
    subscriptions: AdminSubscriptionDto[];
}

export interface AdminSubscriptionDto {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string | null;
    provider: string;
    externalSubscriptionId: string | null;
}

export interface UpdateUserRoleRequest {
    role: string;
}

export interface UpdateUserStatusRequest {
    isActive: boolean;
}

export interface AddSubscriptionRequest {
    plan: string;
    durationDays: number;
}

export interface SystemStatsDto {
    totalUsers: number;
    totalPremiumUsers: number;
    totalVocabularies: number;
    totalReviews: number;
    totalActiveSubscriptions: number;
}

export interface AuditLogDto {
    id: string;
    userId: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    requestName: string | null;
    traceId: string | null;
    additionalInfo: string | null;
    isSuccess: boolean;
    durationMs: number;
    timestamp: string;
}
