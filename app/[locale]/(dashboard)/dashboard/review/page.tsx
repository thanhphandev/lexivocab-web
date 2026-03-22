"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { reviewsApi } from "@/lib/api/api-client";
import type { ReviewSessionDto } from "@/lib/api/types";

import { Flashcard } from "@/components/dashboard/flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BrainCircuit, PartyPopper, ArrowRight, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function ReviewPage() {
    const t = useTranslations("Dashboard.review");
    const locale = useLocale();

    const [session, setSession] = useState<ReviewSessionDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    useEffect(() => {
        const fetchSession = async () => {
            const res = await reviewsApi.getSession();
            if (res.success) {
                setSession(res.data);
            }
            setIsLoading(false);
        };
        fetchSession();
    }, []);

    // Production-grade time tracking
    const startTimeRef = useRef<number>(Date.now());
    const accumulatedTimeRef = useRef<number>(0);
    const lastPauseTimeRef = useRef<number>(0);
    const [pauseNotice, setPauseNotice] = useState(false);
    const MAX_REVIEW_TIME_MS = 60000; // Cap at 60s to avoid idle pollution

    // Reset timer when moving to next card or starting session
    useEffect(() => {
        if (isSessionActive) {
            startTimeRef.current = Date.now();
            accumulatedTimeRef.current = 0;
            setPauseNotice(false);
        }
    }, [currentIndex, isSessionActive]);

    // Handle tab switching / visibility changes
    useEffect(() => {
        let hideTimeout: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pausing: save progress
                accumulatedTimeRef.current += Date.now() - startTimeRef.current;
                lastPauseTimeRef.current = Date.now();
            } else {
                // Resuming: reset start mark
                startTimeRef.current = Date.now();

                // Show notification if paused for > 5 seconds
                if (lastPauseTimeRef.current > 0 && Date.now() - lastPauseTimeRef.current > 5000) {
                    setPauseNotice(true);
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => setPauseNotice(false), 3000);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearTimeout(hideTimeout);
        };
    }, []);

    const handleStart = () => {
        if (session && session.cards.length > 0) {
            setIsSessionActive(true);
            startTimeRef.current = Date.now();
        }
    };

    const handleRate = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
        if (!session) return;
        const currentCard = session.cards[currentIndex];

        // Calculate actual time spent
        const now = Date.now();
        const duration = (now - startTimeRef.current) + accumulatedTimeRef.current;
        const timeSpentMs = Math.min(duration, MAX_REVIEW_TIME_MS);

        // Optimistic UI update
        const nextIndex = currentIndex + 1;
        setReviewedCount(prev => prev + 1);

        // Background API call
        reviewsApi.submitReview({
            userVocabularyId: currentCard.vocabularyId,
            qualityScore: quality,
            timeSpentMs: timeSpentMs
        }).catch(console.error);

        // Move to next card or finish
        if (nextIndex < session.cards.length) {
            setCurrentIndex(nextIndex);
        } else {
            setIsSessionActive(false);
            setSession(null); // Mark as done
            triggerConfetti();
        }
    };

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Finished or Empty State
    if (!session || session.cards.length === 0) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center space-y-6"
                >
                    <div className="mx-auto w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <PartyPopper className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                        {reviewedCount > 0 ? t("sessionComplete") : t("allCaughtUp")}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {reviewedCount > 0
                            ? t("sessionStats", { count: reviewedCount })
                            : t("noReviews")}
                    </p>
                    <div className="pt-6">
                        <Link href={`/${locale}/dashboard`}>
                            <Button size="lg" className="w-full sm:w-auto">
                                <ArrowRight className="mr-2 h-5 w-5" />
                                {t("backToDashboard")}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Pre-start screen
    if (!isSessionActive) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center space-y-6 p-8 border bg-card rounded-3xl shadow-lg"
                >
                    <div className="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-2xl flex flex-col items-center justify-center">
                        <BrainCircuit className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            {t("title")}
                        </h2>
                        <p className="text-muted-foreground">
                            {t("dueToday", { count: session.cards.length })}
                        </p>
                    </div>
                    <Button size="lg" className="w-full text-lg h-14" onClick={handleStart}>
                        {t("startSession")}
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Active session
    const progress = ((currentIndex) / session.cards.length) * 100;

    return (
        <div className="max-w-3xl mx-auto flex flex-col min-h-[70vh] pt-6 relative">
            {/* Pause Notification Overlay */}
            <AnimatePresence>
                {pauseNotice && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-full shadow-md flex items-center gap-2 text-sm font-medium z-50 whitespace-nowrap"
                    >
                        <Timer className="h-4 w-4" />
                        <span>Timer paused to ensure accurate tracking</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <span>{t("progress", { current: currentIndex + 1, total: session.cards.length })}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mb-12">
                <Progress value={progress} className="h-2" />
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <Flashcard
                            card={session.cards[currentIndex]}
                            onRate={handleRate as any}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
