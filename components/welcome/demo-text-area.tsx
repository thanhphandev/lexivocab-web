'use client';

import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DemoTextAreaProps {
    className?: string;
}

export function DemoTextArea({ className }: DemoTextAreaProps) {
    const t = useTranslations('Welcome');

    return (
        <div className={className}>
            {/* Browser Frame */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-orange-100/50 bg-white">
                {/* Browser Header */}
                <div className="bg-gradient-to-b from-slate-50 to-white px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-2">
                        <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 max-w-md mx-auto">
                            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="font-medium truncate">wikipedia.org/wiki/Language_learning</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative p-6 md:p-10 bg-white select-text">
                    {/* Animated hint indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-4 right-4 z-10"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    '0 0 0 0 rgba(251, 146, 60, 0)',
                                    '0 0 0 8px rgba(251, 146, 60, 0.15)',
                                    '0 0 0 0 rgba(251, 146, 60, 0)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-700 text-xs font-medium"
                        >
                            <MousePointerClick className="w-3.5 h-3.5" />
                            {t('demo_hint')}
                        </motion.div>
                    </motion.div>

                    {/* Demo text content with animated cursor hint */}
                    <article className="prose prose-slate max-w-none text-base md:text-lg leading-relaxed relative">
                        <p className="text-slate-700">
                            {t('demo_text_1')}{' '}
                            <span className="relative inline-block">
                                <span className="font-bold text-slate-900 bg-gradient-to-r from-orange-100/0 via-orange-100/70 to-orange-100/0 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
                                    serendipity
                                </span>
                                {/* Animated cursor pointer */}
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 1, 1, 0],
                                        x: [0, 0, 60, 60],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        times: [0, 0.1, 0.6, 1]
                                    }}
                                    className="absolute -bottom-4 left-0 pointer-events-none block"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
                                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#f97316" stroke="white" strokeWidth="1.5" />
                                    </svg>
                                </motion.span>
                            </span>{' '}
                            {t('demo_text_2')}
                        </p>

                        <p className="text-slate-600 mt-4">
                            {t('demo_text_3')}
                        </p>

                        <p className="text-slate-700 mt-4">
                            The concept of <span className="font-semibold">metacognition</span> — thinking about thinking — plays a crucial role in effective language acquisition.
                            When learners become aware of their own cognitive processes, they can better identify which <span className="font-semibold">mnemonic</span> techniques work best for them
                            and develop <span className="font-semibold">autonomous</span> learning strategies.
                        </p>
                    </article>
                </div>
            </div>

            {/* Shimmer animation style */}
            <style jsx global>{`
                @keyframes shimmer {
                    0%, 100% { background-position: 200% 0; }
                    50% { background-position: 0% 0; }
                }
            `}</style>
        </div>
    );
}
