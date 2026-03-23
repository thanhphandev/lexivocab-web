import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle, AlertCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "../error-display";
import { cn } from "@/lib/utils";
import type { QuizDto, ApiErrorResponse } from "@/lib/api/types";

interface QuizTabProps {
    isLoadingQuiz: boolean;
    quizError: ApiErrorResponse | null;
    quiz: QuizDto | null;
    selectedOption: number | null;
    isCorrect: boolean | null;
    fetchQuiz: () => void;
    handleAnswer: (index: number) => void;
}

export function QuizTab({
    isLoadingQuiz,
    quizError,
    quiz,
    selectedOption,
    isCorrect,
    fetchQuiz,
    handleAnswer
}: QuizTabProps) {
    const t = useTranslations("AI");

    if (isLoadingQuiz) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">{t("quiz.generating")}</p>
            </div>
        );
    }

    if (quizError) {
        return <ErrorDisplay error={quizError} onRetry={fetchQuiz} />;
    }

    if (!quiz) return null;

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="font-semibold text-lg mb-2">{quiz.question}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("quiz.instruction")}</p>
            </div>

            <div className="grid gap-3">
                {quiz.options?.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={cn(
                            "w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
                            selectedOption === null
                                ? "hover:border-primary/50 hover:bg-primary/5 bg-background"
                                : selectedOption === idx
                                    ? idx === quiz.correctIndex
                                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                        : "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                    : idx === quiz.correctIndex
                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 opacity-60"
                                        : "opacity-40 grayscale"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{opt}</span>
                            {selectedOption === idx && (
                                idx === quiz.correctIndex
                                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    : <XCircle className="h-5 w-5 text-rose-500" />
                            )}
                        </div>
                        {selectedOption === null && (
                            <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform" />
                        )}
                    </button>
                ))}
            </div>

            {selectedOption !== null && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={cn(
                        "p-4 rounded-xl border flex gap-3",
                        isCorrect ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20" : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/20"
                    )}
                >
                    {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    )}
                    <div className="text-sm">
                        <p className="font-bold mb-1">{isCorrect ? t("quiz.correct") : t("quiz.incorrect")}</p>
                        <p className="text-muted-foreground">{quiz.explanation}</p>
                        <Button variant="ghost" size="sm" onClick={() => fetchQuiz()} className="mt-3 px-0 h-auto font-bold hover:bg-transparent">
                            <RotateCcw className="h-3 w-3 mr-2" />
                            {t("quiz.tryAnother")}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
