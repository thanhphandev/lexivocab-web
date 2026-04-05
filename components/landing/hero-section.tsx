'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Download, Sparkles, Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import versionData from "../../public/version.json";

export default function HeroSection() {
    const t = useTranslations('Hero');

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 pt-16">
            {/* Modern Mesh Background & Dots */}
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-400/20 blur-[120px] rounded-full mix-blend-multiply opacity-70 animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-300/20 blur-[100px] rounded-full mix-blend-multiply opacity-60" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-10"
                    >
                        {/* Premium Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-orange-200/50 shadow-sm"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-tr from-orange-600 to-amber-500" />
                            </span>
                            <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent uppercase">
                                {t('badge', { version: `v${versionData.latest_version}` })}
                            </span>
                        </motion.div>

                        {/* Distinct Typography */}
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-900">
                                {t.rich('title', {
                                    highlight: (chunks) => (
                                        <span className="relative inline-block whitespace-nowrap">
                                            <span className="relative z-10 bg-gradient-to-br from-orange-500 to-amber-600 bg-clip-text text-transparent px-1">
                                                {chunks}
                                            </span>
                                            <motion.span
                                                className="absolute bottom-2 left-0 w-full h-3 bg-orange-200/60 -z-10 rounded-sm transform origin-left"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                                            />
                                        </span>
                                    )
                                })}
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-xl font-light">
                                {t('subtitle')}
                            </p>
                        </div>

                        {/* Modern CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 pt-2"
                        >
                            <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/80 text-white rounded-xl shadow-xl shadow-slate-900/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    <Download className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
                                    {t('cta_install')}
                                </Button>
                            </a>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-white/50 backdrop-blur border-2 border-slate-200 hover:bg-white hover:border-orange-300 hover:text-orange-600 rounded-xl transition-all duration-300 group"
                                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Play className="w-5 h-5 mr-2 text-slate-700 group-hover:text-orange-500 transition-colors" />
                                {t('cta_demo')}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - 3D Glass Showcase */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative hidden lg:block perspective-1000"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200 shadow-slate-300/50 transform-gpu rotate-2 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/hero-showcase.png"
                                alt="LexiVocab Showcase"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>

                        {/* Floating Translation Card (Glassmorphism) */}
                        <motion.div
                            className="absolute -bottom-8 -left-12 z-20 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl shadow-slate-900/10 w-64"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                    <Sparkles className="w-4 h-4 text-orange-500" />
                                    serendipity
                                </div>
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">noun</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                the occurrence and development of events by chance in a happy or beneficial way.
                            </p>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                    {t('saved_word')}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
