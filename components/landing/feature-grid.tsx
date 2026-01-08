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
        <section id="features" className="w-full py-20 md:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white" />
                <div className="absolute top-1/2 left-0 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 md:px-6 mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200/50">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700">{t('section_badge')}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl">
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
                            <Card className="h-full group relative overflow-hidden border-2 border-transparent hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 bg-white/80 backdrop-blur-sm">
                                {feature.badge && (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium">
                                            <Zap className="w-3 h-3" />
                                            {feature.badge}
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="pb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">
                                        {feature.desc}
                                    </CardDescription>
                                </CardContent>
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
