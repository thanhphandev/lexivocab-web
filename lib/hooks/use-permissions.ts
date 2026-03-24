"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useEffect } from "react";

/**
 * Convenience hook for accessing feature gates and quota info.
 * Wraps the permissions data from AuthContext with simple boolean accessors.
 */
export function usePermissions() {
    const { permissions, refreshPermissions } = useAuth();

    // Auto-refresh permissions when quota usage events occur
    useEffect(() => {
        const handleQuotaUpdate = () => {
            refreshPermissions();
        };

        // Listen for custom quota update events
        window.addEventListener("quota-updated", handleQuotaUpdate);
        
        return () => {
            window.removeEventListener("quota-updated", handleQuotaUpdate);
        };
    }, [refreshPermissions]);

    // Helper to safely get flag values
    const getFlag = (code: string, defaultValue: string) => permissions?.featureFlags?.[code] ?? defaultValue;
    const getBoolFlag = (code: string) => getFlag(code, "false") === "true";
    const getIntFlag = (code: string, defaultValue: number) => {
        const val = getFlag(code, "");
        if (!val) return defaultValue;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    };

    const quotaMax = getIntFlag("MAX_WORDS", 50);
    const aiMax = getIntFlag("AI_DAILY_LIMIT", 10);
    const transMax = getIntFlag("LLM_TRANSLATION_LIMIT", 20);

    const planName = permissions?.plan ?? "Free";
    const displayOrder = permissions?.displayOrder ?? 0;

    // const activeAiModel = getBoolFlag("ADVANCED_AI") 
    //     ? "Advanced Models (GPT-4o, Claude 3.5 Sonnet)" 
    //     : "Fast Models (GPT-4o-mini, Gemini Flash)";

    return {
        /** Raw permissions object */
        permissions,
        /** Whether data has loaded */
        isLoaded: permissions !== null,

        /** Current plan name */
        plan: planName,
        /** Current plan display order (tier level) */
        displayOrder,
        /** Dynamic check for a premium account based on plan name (since Admin plan doesn't have isPremium field anymore) */
        isPremium: planName !== "Free" && planName !== "None",

        /** Vocabulary quota usage */
        quotaUsed: permissions?.currentCount ?? 0,
        quotaMax,
        quotaPercent: permissions && quotaMax > 0
            ? Math.round((permissions.currentCount / quotaMax) * 100)
            : 0,

        aiUsed: permissions?.quotaUsages?.["AI_DAILY_LIMIT"] ?? 0,
        aiMax,
        aiPercent: permissions && aiMax > 0
            ? Math.round(((permissions.quotaUsages?.["AI_DAILY_LIMIT"] ?? 0) / aiMax) * 100)
            : 0,

        transUsed: permissions?.quotaUsages?.["LLM_TRANSLATION_LIMIT"] ?? 0,
        transMax,
        transPercent: permissions && transMax > 0
            ? Math.round(((permissions.quotaUsages?.["LLM_TRANSLATION_LIMIT"] ?? 0) / transMax) * 100)
            : 0,

        // activeAiModel,

        /** Feature gates */
        canExport: getBoolFlag("EXPORT_PDF") || getBoolFlag("EXPORT_ANKI"),
        canUseAi: getBoolFlag("AI_ACCESS"),
        canBatchImport: planName !== "Free" && planName !== "None", // Assuming batch import is also premium

        /** Support Priority */
        supportLevel: getFlag("SUPPORT_LEVEL", "Standard"),

        /** Plan expiration */
        planExpiresAt: permissions?.planExpiresAt ?? null,

        /** Re-fetch permissions (e.g. after upgrade) */
        refreshPermissions
    };
}
