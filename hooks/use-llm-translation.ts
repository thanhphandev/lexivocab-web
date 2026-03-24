import { useState, useCallback, useRef } from "react";
import { aiApi } from "@/lib/api/api-client";
import { notifyQuotaUpdateDebounced } from "@/lib/utils/quota-events";

export interface LLMTranslationData {
    word: string;
    meaning: string;
    phonetic: string;
    context: string;
}

export function useLLMTranslation() {
    const [isStreaming, setIsStreaming] = useState(false);
    const isStreamingRef = useRef(false);
    const [aiData, setAiData] = useState<LLMTranslationData>({ word: "", meaning: "", phonetic: "", context: "" });
    const [streamingError, setStreamingError] = useState<string | null>(null);

    const incrementalParse = (json: string): LLMTranslationData => {
        const streamMatch = (k: string) => {
            const regex = new RegExp(`"${k}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)(?:"|$)`);
            const match = json.match(regex);
            return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : "";
        };

        let parsedMeaning = streamMatch("meaning");

        // Clean up LLM hallucinations where it puts a full sentence context in parentheses inside the meaning field
        parsedMeaning = parsedMeaning.replace(/\s*\(\.\s*.*?\)?$/, ''); // Catch " (. sentence"
        parsedMeaning = parsedMeaning.replace(/\s*\([^)]{20,}\)$/, ''); // Catch any long parenthesis at the end (over 20 chars)

        return {
            word: streamMatch("word"),
            meaning: parsedMeaning,
            phonetic: streamMatch("phonetic"),
            context: streamMatch("context")
        };
    };

    const streamTranslation = useCallback(async (
        word: string,
        context?: string,
        provider?: string,
        modelId?: string,
        from?: string,
        to?: string,
        customParams?: { customBaseUrl?: string, customApiKey?: string, customModel?: string }
    ) => {
        if (isStreamingRef.current) return;

        isStreamingRef.current = true;
        setIsStreaming(true);
        setStreamingError(null);
        setAiData({ word: "", meaning: "", phonetic: "", context: "" });

        try {
            const actualProvider = provider || "cloudflare";
            const isNonStreamingModel = ['google', 'bing', 'lingva'].includes(actualProvider.toLowerCase().split('/')[0]);

            if (isNonStreamingModel) {
                const result = await aiApi.translate(word, context, actualProvider, modelId, from, to, customParams);
                setAiData({
                    word: result.word || "",
                    meaning: result.meaning || "",
                    phonetic: result.phonetic || "",
                    context: result.context || ""
                });
                // Notify quota update after successful translation
                notifyQuotaUpdateDebounced();
            } else {
                const stream = aiApi.streamTranslation(word, context, provider, modelId, from, to, customParams);
                let fullText = "";

                for await (const chunk of stream) {
                    if (chunk.type === "content" && chunk.delta) {
                        fullText += chunk.delta;
                        setAiData(prev => ({
                            ...prev,
                            ...incrementalParse(fullText)
                        }));
                    } else if (chunk.type === "error") {
                        setStreamingError(chunk.message || "AI Error");
                    }
                }
                // Notify quota update after successful streaming translation
                notifyQuotaUpdateDebounced();
            }
        } catch (err: any) {
            const status = err?.status;
            const code = err?.errorCode || err?.code;
            let message: string;
            
            if (code === "AI_QUOTA_EXCEEDED" || code === "AUTHZ_INSUFFICIENT_PERMISSIONS" || status === 403) {
                message = "LLM translation quota reached. Upgrade to Pro.";
            } else if (status === 401) {
                message = "Please sign in to use LLM features.";
            } else if (code === "RATE_LIMIT_EXCEEDED" || status === 429) {
                message = "Too many requests. Please wait a moment.";
            } else {
                message = err?.message || "Failed to connect to AI service";
            }
            setStreamingError(message);
        } finally {
            isStreamingRef.current = false;
            setIsStreaming(false);
        }
    }, []);

    return {
        isStreaming,
        aiData,
        streamingError,
        streamTranslation,
        resetStream: () => setAiData({ word: "", meaning: "", phonetic: "", context: "" })
    };
}
