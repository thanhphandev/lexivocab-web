import { useTranslations } from "next-intl";
import { Loader2, ChevronRight, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ErrorDisplay } from "../error-display";
import type { RelatedWordsDto, ApiErrorResponse } from "@/lib/api/types";

interface RelatedTabProps {
    isLoadingRelated: boolean;
    relatedError: ApiErrorResponse | null;
    related: RelatedWordsDto | null;
    fetchRelated: () => void;
}

export function RelatedTab({
    isLoadingRelated,
    relatedError,
    related,
    fetchRelated
}: RelatedTabProps) {
    const t = useTranslations("AI");

    if (isLoadingRelated) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">{t("related.finding")}</p>
            </div>
        );
    }

    if (relatedError) {
        return <ErrorDisplay error={relatedError} onRetry={fetchRelated} />;
    }

    if (!related) return null;

    return (
        <div className="space-y-8">
            {/* Synonyms */}
            {related.synonyms && related.synonyms.length > 0 && (
                <section>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t("related.synonyms")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {related.synonyms.map((s, idx) => (
                            <Badge key={idx} variant="outline" className="bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition-colors border-emerald-500/20">
                                {s}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

            {/* Antonyms */}
            {related.antonyms && related.antonyms.length > 0 && (
                <section>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t("related.antonyms")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {related.antonyms.map((a, idx) => (
                            <Badge key={idx} variant="outline" className="bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-colors border-rose-500/20">
                                {a}
                            </Badge>
                        ))}
                    </div>
                </section>
            )}

            {/* Collocations */}
            {related.collocations && related.collocations.length > 0 && (
                <section>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t("related.collocations")}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                        {related.collocations.map((c, idx) => (
                            <div key={idx} className="text-sm p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center gap-2">
                                <ChevronRight className="h-3 w-3 text-blue-400 shrink-0" />
                                {c}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Mnemonic */}
            {related.mnemonic && (
                <section>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-amber-600 font-semibold text-sm">
                            <Brain className="h-4 w-4 shrink-0" />
                            Mẹo nhớ thú vị
                        </div>
                        <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                            {related.mnemonic}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
