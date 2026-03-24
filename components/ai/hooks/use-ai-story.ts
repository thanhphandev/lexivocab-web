import { useState, useRef } from "react";
import type { ApiErrorResponse } from "@/lib/api/types";
import { notifyQuotaUpdateDebounced } from "@/lib/utils/quota-events";

export function useAiStory(word: string) {
    const [isStoryStreaming, setIsStoryStreaming] = useState(false);
    const [storyStreamingContent, setStoryStreamingContent] = useState("");
    const [storyError, setStoryError] = useState<ApiErrorResponse | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStoryStreaming = () => {
        abortControllerRef.current?.abort();
    };

    const startStoryStreaming = async (reqModelId: string, reqProvider: string) => {
        if (!word) return;
        setStoryStreamingContent("");
        setStoryError(null);
        setIsStoryStreaming(true);

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            let url = `/api/proxy/ai/story-stream?word=${encodeURIComponent(word)}`;
            if (reqProvider) url += `&provider=${encodeURIComponent(reqProvider)}`;
            if (reqModelId) url += `&modelId=${encodeURIComponent(reqModelId)}`;
            
            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) {
                let errObj: ApiErrorResponse = { success: false, error: "Failed finding story" };
                try {
                    const body = await response.json();
                    if (body.error) errObj = body;
                } catch { }
                throw errObj;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No readable stream");

            let done = false;
            let buffer = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: !done });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === "content") {
                                    setStoryStreamingContent(prev => prev + parsed.delta);
                                } else if (parsed.type === "error") {
                                    setStoryError({ success: false, error: parsed.message, errorCode: parsed.code, traceId: parsed.traceId });
                                }
                            } catch { }
                        }
                    }
                }
            }
            
            // Notify quota update after successful story generation
            if (!controller.signal.aborted) {
                notifyQuotaUpdateDebounced();
            }
        } catch (error) {
            const err = error as Error & { success?: boolean };
            if (err.name !== "AbortError") {
                setStoryError(err.success === false ? (err as unknown as ApiErrorResponse) : { success: false, error: err.message || "An error occurred" });
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsStoryStreaming(false);
            }
        }
    };

    return {
        isStoryStreaming,
        storyStreamingContent,
        storyError,
        startStoryStreaming,
        stopStoryStreaming
    };
}
