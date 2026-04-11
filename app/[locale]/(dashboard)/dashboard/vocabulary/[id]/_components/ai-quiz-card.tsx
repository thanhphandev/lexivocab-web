"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, ChevronRight, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { aiApi } from "@/lib/api/api-client";
import type { QuizDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AIQuizCardProps {
  word: string;
}

export function AIQuizCard({ word }: AIQuizCardProps) {
  const t = useTranslations("Dashboard.vocabularyDetail.quiz");
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
      const res = await aiApi.getQuiz(word);
      if (res.success) {
        setQuiz(res.data);
      } else {
        toast.error(t("errorFetch"));
      }
    } catch (error) {
      toast.error(t("errorFetch"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setTimeout(() => setShowExplanation(true), 600);
  };

  if (!quiz && !loading) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("description")}
          </p>
        </div>
        <Button onClick={fetchQuiz} className="rounded-xl px-8 hover:scale-105 transition-transform active:scale-95">
          {t("start")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-lg transition-all duration-300">
      <div className="p-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
      
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{t("aiPoweredLabel")}</span>
          </div>
          <button 
            onClick={fetchQuiz} 
            disabled={loading}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title={t("refresh")}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">{t("generating")}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {quiz && (
              <motion.div
                key={quiz.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="text-xl font-medium leading-relaxed">
                  {quiz.question}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {quiz.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === quiz.correctIndex;
                    const isWrong = isSelected && !isCorrect;
                    
                    let variantClass = "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-primary/20";
                    if (selectedOption !== null) {
                        if (isCorrect) variantClass = "bg-success/10 border-success text-success-foreground font-bold shadow-[0_0_15px_-5px_hsl(var(--success)/0.3)]";
                        if (isWrong) variantClass = "bg-destructive/10 border-destructive text-destructive-foreground";
                        if (!isSelected && !isCorrect) variantClass = "opacity-40 bg-muted/20 border-transparent";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        disabled={selectedOption !== null}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between gap-3 group",
                          variantClass
                        )}
                      >
                        <span className="flex-1">{option}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {selectedOption !== null && isWrong && <XCircle className="w-5 h-5 shrink-0" />}
                        {selectedOption === null && <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-1 transition-all" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl bg-primary/5 p-4 border border-primary/10 overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounder-full bg-primary/20 mt-0.5">
                            <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">{t("explanationTitle")}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {quiz.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedOption !== null && (
                   <Button onClick={fetchQuiz} variant="outline" className="w-full rounded-xl mt-4">
                      {t("nextQuiz")}
                   </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
