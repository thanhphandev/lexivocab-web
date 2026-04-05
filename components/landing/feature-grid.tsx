'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { MousePointerClick, Languages, Highlighter, LayoutDashboard, Sparkles, Zap } from "lucide-react";

export default function FeatureGrid() {
    const t = useTranslations('Features');

    const features = [
        {
            key: 'smart_bubble',
            icon: MousePointerClick,
            title: t('smart_bubble_title'),
            desc: t('smart_bubble_desc'),
            gradient: 'from-orange-500 to-amber-500'
        },
        {
            key: 'context_trans',
            icon: Languages,
            title: t('context_trans_title'),
            desc: t('context_trans_desc'),
            gradient: 'from-amber-500 to-yellow-500'
        },
        {
            key: 'highlight',
            icon: Highlighter,
            title: t('highlight_title'),
            desc: t('highlight_desc'),
            gradient: 'from-orange-600 to-orange-400',
            badge: t('highlight_badge')
        },
        {
            key: 'dashboard',
            icon: LayoutDashboard,
            title: t('dashboard_title'),
            desc: t('dashboard_desc'),
            gradient: 'from-yellow-500 to-amber-400'
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section id="features" className="w-full py-24 md:py-32 relative bg-white">
            {/* Minimal Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.05),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05),transparent_70%)]" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{t('section_badge')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl text-slate-900">
                        {t('title')}
                    </h2>
                    <p className="text-xl text-slate-600 max-w-xl font-light">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[minmax(280px,auto)]">
                    {/* Item 1: Large Feature (spans 2 columns on desktop) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="md:col-span-2 relative group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 md:p-10 h-full flex flex-col justify-between relative z-10">
                            <div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <MousePointerClick className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">{t('smart_bubble_title')}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                                    {t('smart_bubble_desc')}
                                </p>
                            </div>
                            
                            {/* Abstract visual representation */}
                            <div className="mt-8 flex gap-2 overflow-hidden mask-image-custom">
                                <div className="h-12 w-32 bg-slate-100 rounded-lg animate-pulse-slow" />
                                <div className="h-12 w-48 bg-orange-100 border border-orange-200 rounded-lg flex items-center px-4">
                                    <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                                    <div className="h-2 w-24 bg-orange-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 2: Standard Feature */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-bl from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 h-full flex flex-col relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Languages className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">{t('context_trans_title')}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {t('context_trans_desc')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Item 3: Highlight feature with badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="relative group overflow-hidden rounded-[2rem] border-2 border-orange-200 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500"
                    >
                        <div className="absolute top-4 right-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white shadow-sm">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span className="text-xs font-bold tracking-wider uppercase">{t('highlight_badge')}</span>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.1),transparent)] opacity-100" />
                        <div className="p-8 h-full flex flex-col relative z-10 mt-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                <Highlighter className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">{t('highlight_title')}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {t('highlight_desc')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Item 4: Dashboard feature spanning 2 columns */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="md:col-span-2 relative group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/30"
                    >
                        {/* Glow effect for dark card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/20 blur-[60px] rounded-full group-hover:bg-yellow-500/30 transition-colors duration-500" />
                        
                        <div className="p-8 md:p-10 h-full flex flex-col justify-between relative z-10">
                            <div>
                                <div className="w-14 h-14 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <LayoutDashboard className="w-7 h-7 text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight mb-3">{t('dashboard_title')}</h3>
                                <p className="text-lg text-slate-300 leading-relaxed max-w-md font-light">
                                    {t('dashboard_desc')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
