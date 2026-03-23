import { useTranslations } from "next-intl";
import { AlertCircle, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/lib/api/types";
import { ErrorCode } from "@/lib/api/types";

interface ErrorDisplayProps {
    error: ApiErrorResponse;
    onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    const t = useTranslations("AI");

    const isQuotaError = (errObj: ApiErrorResponse | null) => {
        if (!errObj) return false;
        if (errObj.errorCode === ErrorCode.AI_QUOTA_EXCEEDED || errObj.errorCode === ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS) return true;
        const lower = errObj.error?.toLowerCase() || "";
        return lower.includes("quota") || lower.includes("limit") || lower.includes("hạn ngạch") || lower.includes("giới hạn");
    };

    const isQuota = isQuotaError(error);

    return (
        <div className={cn(
            "p-4 rounded-xl border flex gap-3 text-sm flex-col sm:flex-row items-start",
            isQuota
                ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                : "bg-destructive/5 border-destructive/20 text-destructive"
        )}>
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="font-semibold text-base mb-1">
                    {isQuota ? t("errors.quotaReachedTitle") : t("errors.title")}
                </p>
                <p className="opacity-90 leading-relaxed mb-1">{error.error || "An error occurred"}</p>
                {error.traceId && (
                    <p className="opacity-50 text-[10px] font-mono leading-relaxed mb-4">Trace ID: {error.traceId}</p>
                )}
                {!error.traceId && <div className="mb-4" />}

                <div className="flex flex-wrap gap-2">
                    {isQuota ? (
                        <Link href="/dashboard/billing">
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shadow-none border-0">
                                <Sparkles className="h-3 w-3 mr-2" />
                                {t("actions.upgradePlan")}
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" size="sm" onClick={onRetry} className="border-current hover:bg-current/10 bg-transparent">
                            <RotateCcw className="h-3 w-3 mr-2" />
                            {t("actions.tryAgain")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
