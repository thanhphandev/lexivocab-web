'use client';

import { motion } from 'framer-motion';
import { Zap, Sparkles, Type, Keyboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Live Input Area ───────────────────────────────────────────────────────────
function LiveInputArea() {
    const t = useTranslations('Welcome');
    const [spaceCount, setSpaceCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const spaceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resetSpaceCount = useCallback(() => {
        if (spaceTimerRef.current) clearTimeout(spaceTimerRef.current);
        spaceTimerRef.current = setTimeout(() => setSpaceCount(0), 800);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === ' ') {
            setSpaceCount(prev => {
                const next = Math.min(prev + 1, 3);
                return next;
            });
            resetSpaceCount();
        } else {
            setSpaceCount(0);
        }
    }, [resetSpaceCount]);

    // Auto-reset space dots after 3
    useEffect(() => {
        if (spaceCount === 3) {
            const timeout = setTimeout(() => setSpaceCount(0), 1500);
            return () => clearTimeout(timeout);
        }
    }, [spaceCount]);

    return (
        <div className="relative">
            {/* Input card */}
            <div className={`
                bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-300
                ${isFocused
                    ? 'border-orange-300 shadow-md shadow-orange-100/50 ring-2 ring-orange-100'
                    : 'border-slate-200 hover:border-slate-300'
                }
            `}>
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Type className="w-3 h-3" />
                        <span className="font-medium">{t('onboarding_input_label')}</span>
                    </div>
                    <div className="flex-1" />
                    {/* Space counter dots */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: spaceCount >= i ? 1 : 0.5,
                                    backgroundColor: spaceCount >= i ? '#fb923c' : '#e2e8f0',
                                }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="w-1.5 h-1.5 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* Live textarea */}
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={t('onboarding_input_placeholder')}
                        className="w-full px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent outline-none resize-none leading-relaxed min-h-[100px]"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* Space key hint */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={spaceCount >= i ? {
                            y: [0, 2, 0],
                            scale: [1, 0.96, 1],
                        } : {}}
                        transition={{ duration: 0.12 }}
                    >
                        <div className={`
                            px-3.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase
                            border transition-colors duration-100
                            ${spaceCount >= i
                                ? 'bg-orange-100 border-orange-300 text-orange-700 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]'
                                : 'bg-white border-slate-200 text-slate-400 shadow-[0_2px_0_0_rgba(0,0,0,0.06)]'
                            }
                        `}>
                            Space
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Step Item ─────────────────────────────────────────────────────────────────
function StepItem({
    stepNumber,
    icon: Icon,
    title,
    description,
}: {
    stepNumber: number;
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/80 flex items-center justify-center group-hover:from-orange-100 group-hover:to-amber-100 transition-colors duration-200">
                    <Icon className="w-4 h-4 text-orange-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {stepNumber}
                </div>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-sm font-semibold text-slate-800 mb-0.5 leading-tight">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function SpaceTranslateOnboarding() {
    const t = useTranslations('Welcome');

    return (
        <div className="h-full flex flex-col items-center justify-center px-4 md:px-6 py-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-6 max-w-2xl"
            >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 text-orange-700 text-xs font-semibold">
                    <Keyboard className="w-3.5 h-3.5" />
                    {t('onboarding_badge')}
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    {t('onboarding_title')}
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    {t('onboarding_subtitle')}
                </p>
            </motion.div>

            {/* Content Grid */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center"
            >
                {/* Left: Live Input (3/5) */}
                <div className="lg:col-span-3">
                    <LiveInputArea />
                </div>

                {/* Right: Steps (2/5) */}
                <div className="lg:col-span-2 space-y-4">
                    <StepItem
                        stepNumber={1}
                        icon={Type}
                        title={t('onboarding_step1_title')}
                        description={t('onboarding_step1_desc')}
                    />
                    <StepItem
                        stepNumber={2}
                        icon={Keyboard}
                        title={t('onboarding_step2_title')}
                        description={t('onboarding_step2_desc')}
                    />
                    <StepItem
                        stepNumber={3}
                        icon={Zap}
                        title={t('onboarding_step3_title')}
                        description={t('onboarding_step3_desc')}
                    />
                </div>
            </motion.div>

            {/* Bottom Tip */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full max-w-3xl mt-6"
            >
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/70 border border-orange-100/50">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-700">{t('onboarding_tip_label')}</span>{' '}
                        {t('onboarding_tip_text')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
