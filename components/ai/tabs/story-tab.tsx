import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, Square } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "../error-display";
import { parsePartialAIJson } from "../utils";
import type { ApiErrorResponse } from "@/lib/api/types";
import { RefObject } from "react";

interface StoryTabProps {
    isStoryStreaming: boolean;
    storyStreamingContent: string;
    storyError: ApiErrorResponse | null;
    startStoryStreaming: () => void;
    stopStoryStreaming: () => void;
    storyScrollRef: RefObject<HTMLDivElement | null>;
}

export function StoryTab({
    isStoryStreaming,
    storyStreamingContent,
    storyError,
    startStoryStreaming,
    stopStoryStreaming,
    storyScrollRef
}: StoryTabProps) {
    const t = useTranslations("AI");

    if (storyError) {
        return <ErrorDisplay error={storyError} onRetry={() => startStoryStreaming()} />;
    }

    const partial = parsePartialAIJson(storyStreamingContent);

    return (
        <div className="space-y-6">
            <div className="relative max-w-none">
                <div className="space-y-6">
                    {partial.story && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                                <BookOpen className="h-4 w-4" />
                                {t("story.title")}
                            </div>
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
                                {partial.story}
                                {isStoryStreaming && (!partial.translation) && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-blue-500 align-middle" />}
                            </div>
                        </div>
                    )}
                    {partial.translation && (
                        <div className="p-4 rounded-xl bg-muted/50 border border-border mt-4">
                            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                                {t("story.translation")}
                            </div>
                            <div className="text-sm font-medium leading-relaxed">
                                {partial.translation}
                                {isStoryStreaming && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-muted-foreground align-middle" />}
                            </div>
                        </div>
                    )}
                    {!partial.story && isStoryStreaming && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse p-4 text-sm font-medium border rounded-xl border-dashed">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            {t("story.generating")}
                        </div>
                    )}
                </div>
                <div ref={storyScrollRef} />
            </div>
            {isStoryStreaming && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t flex flex-col gap-4">
                    <Button variant="outline" size="sm" onClick={stopStoryStreaming} className="w-fit text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
                        <Square className="h-3 w-3 mr-2 fill-current" />
                        {t("story.stop") || "Stop"}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
