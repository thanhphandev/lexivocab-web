import { useState } from "react";
import { aiApi } from "@/lib/api/api-client";
import type { RelatedWordsDto, ApiErrorResponse } from "@/lib/api/types";
import { notifyQuotaUpdateDebounced } from "@/lib/utils/quota-events";

export function useAiRelated(word: string) {
    const [related, setRelated] = useState<RelatedWordsDto | null>(null);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    const [relatedError, setRelatedError] = useState<ApiErrorResponse | null>(null);

    const fetchRelated = async (reqModelId: string, reqProvider: string) => {
        if (isLoadingRelated || !word) return;
        setIsLoadingRelated(true);
        setRelatedError(null);
        
        try {
            const res = await aiApi.getRelated(word, reqProvider, reqModelId);
            if (res.success) {
                setRelated(res.data);
                // Notify quota update after successful related words generation
                notifyQuotaUpdateDebounced();
            } else {
                setRelatedError(res);
            }
        } catch (error) {
            const err = error as Error;
            setRelatedError({ success: false, error: err.message || "Unexpected error occurred fetching related words" });
        } finally {
            setIsLoadingRelated(false);
        }
    };

    return {
        related,
        isLoadingRelated,
        relatedError,
        fetchRelated,
        setRelated
    };
}
