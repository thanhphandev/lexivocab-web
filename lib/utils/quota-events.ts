/**
 * Utility functions for triggering quota update events
 * Use these after any action that consumes quota (AI, translations, word additions, etc.)
 */

/**
 * Dispatch a custom event to notify all listeners that quota has been updated
 * This will trigger a refresh of permissions data across the app
 */
export function notifyQuotaUpdate() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("quota-updated"));
    }
}

/**
 * Debounced version to avoid excessive API calls when multiple quota updates happen rapidly
 */
let quotaUpdateTimeout: NodeJS.Timeout | null = null;

export function notifyQuotaUpdateDebounced(delayMs: number = 500) {
    if (quotaUpdateTimeout) {
        clearTimeout(quotaUpdateTimeout);
    }
    
    quotaUpdateTimeout = setTimeout(() => {
        notifyQuotaUpdate();
        quotaUpdateTimeout = null;
    }, delayMs);
}
