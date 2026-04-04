'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import {
    Rocket,
    ChevronRight,
    ChevronLeft,
    Keyboard,
} from 'lucide-react';
import { DemoTextArea } from '@/components/welcome/demo-text-area';
import { SpaceTranslateOnboarding } from '@/components/welcome/space-translate-onboarding';

// ─── Slide transition variants ─────────────────────────────────────────────────
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '60%' : '-60%',
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '60%' : '-60%',
        opacity: 0,
        scale: 0.95,
    }),
};

const TOTAL_SLIDES = 2;

export default function WelcomePage() {
    const t = useTranslations('Welcome');
    const [[currentSlide, direction], setSlide] = useState([0, 0]);

    const paginate = useCallback((newDirection: number) => {
        setSlide(([prev]) => {
            const next = prev + newDirection;
            if (next < 0 || next >= TOTAL_SLIDES) return [prev, 0];
            return [next, newDirection];
        });
    }, []);

    const goToSlide = useCallback((index: number) => {
        setSlide(([prev]) => [index, index > prev ? 1 : -1]);
    }, []);

    return (
        <main className="h-[calc(100dvh-64px)] bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden flex flex-col relative">
            {/* ── Top Navigation Bar ──────────────────────────────────── */}
            <header className="flex-shrink-0 relative z-20">
                <div className="container px-4 md:px-6 mx-auto flex items-center justify-between py-4">
                    {/* Step indicators */}
                    <div className="flex items-center gap-3">
                        {[
                            { icon: Rocket, label: t('nav_slide_demo') },
                            { icon: Keyboard, label: t('nav_slide_space') },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`
                                    group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer
                                    ${currentSlide === i
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                                        : 'bg-white/80 text-slate-500 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 hover:border-orange-200'
                                    }
                                `}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Slide counter */}
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="font-bold text-orange-500">{currentSlide + 1}</span>
                        <span>/</span>
                        <span>{TOTAL_SLIDES}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-slate-100">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
                        initial={false}
                        animate={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </header>

            {/* ── Slide Content Area ─────────────────────────────────── */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 250, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.3 },
                        }}
                        className="absolute inset-0 flex items-center justify-center overflow-y-auto"
                    >
                        {/* Slide 0: Highlight Demo */}
                        {currentSlide === 0 && (
                            <div className="w-full h-full">
                                <DemoTextArea />
                            </div>
                        )}

                        {/* Slide 1: Space Translate Onboarding */}
                        {currentSlide === 1 && (
                            <div className="w-full h-full">
                                <SpaceTranslateOnboarding />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Bottom Navigation Arrows ────────────────────────────── */}
            <footer className="flex-shrink-0 relative z-20 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
                <div className="container px-4 md:px-6 mx-auto flex items-center justify-between py-3">
                    {/* Previous */}
                    <button
                        onClick={() => paginate(-1)}
                        disabled={currentSlide === 0}
                        className={`
                            group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                            ${currentSlide === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600 active:scale-95'
                            }
                        `}
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        {t('nav_prev')}
                    </button>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className="p-1 cursor-pointer"
                            >
                                <motion.div
                                    animate={{
                                        width: currentSlide === i ? 24 : 8,
                                        backgroundColor: currentSlide === i ? '#f97316' : '#e2e8f0',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="h-2 rounded-full"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        onClick={() => paginate(1)}
                        disabled={currentSlide === TOTAL_SLIDES - 1}
                        className={`
                            group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                            ${currentSlide === TOTAL_SLIDES - 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95'
                            }
                        `}
                    >
                        {t('nav_next')}
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>
            </footer>
        </main>
    );
}
