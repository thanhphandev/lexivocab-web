'use client';

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Download, MousePointerClick, BookOpenCheck } from "lucide-react";

export default function HowItWorks() {
    const t = useTranslations('HowItWorks');

    const steps = [
        {
            key: 'step1',
            icon: Download,
            title: t('step1_title'),
            desc: t('step1_desc'),
            color: 'bg-blue-100 text-blue-600'
        },
        {
            key: 'step2',
            icon: MousePointerClick,
            title: t('step2_title'),
            desc: t('step2_desc'),
            color: 'bg-orange-100 text-orange-600'
        },
        {
            key: 'step3',
            icon: BookOpenCheck,
            title: t('step3_title'),
            desc: t('step3_desc'),
            color: 'bg-green-100 text-green-600'
        }
    ];

    return (
        <section id="how-it-works" className="w-full py-20 bg-gradient-to-b from-white to-orange-50/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('title')}</h2>
                    <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="relative z-10 flex flex-col items-center text-center"
                        >
                            <div className={`w-18 h-18 rounded-2xl ${step.color} p-4 mb-6 shadow-lg rotate-3 transition-transform hover:rotate-0`}>
                                <step.icon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-sm">
                                {step.desc}
                            </p>

                            {/* Step Number Badge */}
                            <div className="absolute top-0 right-1/4 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center text-sm font-bold text-orange-500 shadow-sm">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
