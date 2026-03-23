import { useTranslations } from "next-intl";
import { BookOpen, Sparkles, Square, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "../error-display";
import { parsePartialAIJson } from "../utils";
import type { ApiErrorResponse } from "@/lib/api/types";
import { RefObject } from "react";

interface ExplainTabProps {
    isStreaming: boolean;
    streamingContent: string;
    explainError: ApiErrorResponse | null;
    startStreaming: () => void;
    stopStreaming: () => void;
    explainScrollRef: RefObject<HTMLDivElement | null>;
}

export function ExplainTab({
    isStreaming,
    streamingContent,
    explainError,
    startStreaming,
    stopStreaming,
    explainScrollRef
}: ExplainTabProps) {
    const t = useTranslations("AI");

    if (explainError) {
        return <ErrorDisplay error={explainError} onRetry={() => startStreaming()} />;
    }

    const partial = parsePartialAIJson(streamingContent);

    return (
        <div className="space-y-6">
            <div className="relative max-w-none">
                <div className="space-y-6">
                    {partial.explanation && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                                <BookOpen className="h-4 w-4" />
                                {t("explanation.title")}
                            </div>
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                {partial.explanation}
                                {isStreaming && (!partial.nuances && !partial.examples && !partial.tip) && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle" />}
                            </div>
                        </div>
                    )}

                    {partial.nuances && partial.nuances.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                {t("explanation.nuances")}
                            </div>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                                {partial.nuances.map((n, i) => (
                                    <li key={i}>{n}</li>
                                ))}
                                {isStreaming && (!partial.examples && !partial.tip) && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 align-middle" />}
                            </ul>
                        </div>
                    )}

                    {partial.examples && partial.examples.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                {t("explanation.examples")}
                            </div>
                            <div className="space-y-2">
                                {partial.examples.map((ex, i) => (
                                    <div key={i} className="text-sm italic p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 border-l-4 border-l-blue-400">
                                        &quot;{ex}&quot;
                                    </div>
                                ))}
                                {isStreaming && !partial.tip && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 mt-2 bg-blue-500 align-middle" />}
                            </div>
                        </div>
                    )}

                    {partial.tip && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 mt-6 !mt-8">
                            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-[11px]">
                                <Sparkles className="h-3 w-3" />
                                {t("tags.proTip")}
                            </div>
                            <div className="text-sm font-medium leading-relaxed">
                                {partial.tip}
                                {isStreaming && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-amber-500 align-middle" />}
                            </div>
                        </div>
                    )}

                    {!partial.explanation && isStreaming && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse p-4 text-sm font-medium border rounded-xl border-dashed">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {t("explanation.analyzing")}
                        </div>
                    )}
                </div>
                <div ref={explainScrollRef} />
            </div>

            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t flex flex-col gap-4"
                >
                    <Button variant="outline" size="sm" onClick={stopStreaming} className="w-fit text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
                        <Square className="h-3 w-3 mr-2 fill-current" />
                        Stop
                    </Button>
                </motion.div>
            )}

            {!isStreaming && streamingContent && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t flex flex-col gap-4"
                >
                    <Button variant="outline" size="sm" onClick={() => startStreaming()} className="w-fit">
                        <RotateCcw className="h-3 w-3 mr-2" />
                        {t("actions.regenerate")}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
