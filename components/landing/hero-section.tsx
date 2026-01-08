'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/config";

export default function HeroSection() {
    const t = useTranslations('Hero');

    return (
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-100/20 to-amber-100/20 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200/50"
                        >
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">{t('badge')}</span>
                        </motion.div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                {t.rich('title', {
                                    highlight: (chunks) => (
                                        <span className="relative inline-block">
                                            <span className="relative z-10 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                                {chunks}
                                            </span>
                                            <span className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-orange-200 to-amber-200 -z-0 -rotate-1" />
                                        </span>
                                    )
                                })}
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                {t('subtitle')}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    {t('cta_install')}
                                </Button>
                            </a>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-lg font-semibold border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all"
                                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {t('cta_demo')}
                            </Button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex items-center gap-6 pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-amber-300 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{t('users_count')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                                <span className="text-sm text-muted-foreground ml-1">{t('rating')}</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Video */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="relative"
                        id="demo-video"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 border border-orange-100">
                            {/* Browser Frame */}
                            <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3 flex items-center gap-2 border-b">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-white rounded-md px-4 py-1.5 text-sm text-muted-foreground flex items-center gap-2 max-w-md mx-auto">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        lexivocab.com
                                    </div>
                                </div>
                            </div>
                            {/* Video */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full aspect-video object-cover"
                            >
                                <source src="/marketing.mp4" type="video/mp4" />
                            </video>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                    <Image src="/icon.png" alt="LexiVocab" width={24} height={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">LexiVocab</p>
                                    <p className="text-xs text-muted-foreground">Chrome Extension</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                            className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-700">{t('saved_word')}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
