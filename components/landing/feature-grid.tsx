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
        <section id="features" className="w-full py-20 md:py-32 relative overflow-hidden bg-muted/30 border-y border-border/50">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

            <div className="container px-4 md:px-6 mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('section_badge')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    {features.map((feature) => (
                        <motion.div key={feature.key} variants={item}>
                            <Card className="h-full group relative overflow-hidden border bg-background hover:border-primary/50 transition-all duration-300 hover:shadow-lg shadow-sm">
                                {feature.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                            <Zap className="w-3 h-3" />
                                            {feature.badge}
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="pb-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                                        {feature.desc}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
