'use client';

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Play, Sparkles, Youtube } from "lucide-react";
import { useState } from "react";
import { siteConfig } from '@/lib/config';

export default function VideoDemoSection() {
    const t = useTranslations('VideoDemo');
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section id="demo-video" className="w-full py-20 md:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                {/* Dark gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />

                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-20 right-[10%] w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
                        willChange: 'transform',
                    }}
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, -30, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
                        willChange: 'transform',
                    }}
                    animate={{
                        scale: [1.1, 1, 1.1],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #fff 1px, transparent 1px),
                            linear-gradient(to bottom, #fff 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 backdrop-blur-sm">
                        <Youtube className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-300">{t('badge')}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl text-white">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-slate-400 max-w-xl">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Video Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative max-w-5xl mx-auto"
                >
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-2xl rounded-3xl opacity-60" />

                    {/* Video wrapper with aspect ratio */}
                    <div className="relative rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl shadow-orange-500/10 bg-slate-900">
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center px-4 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="ml-4 flex-1 max-w-md">
                                <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-xs text-slate-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-orange-400" />
                                    LexiVocab Demo
                                </div>
                            </div>
                        </div>

                        {/* Video aspect ratio container */}
                        <div className="relative pt-12 aspect-video bg-gradient-to-br from-slate-900 to-slate-950">
                            {!isPlaying ? (
                                // Thumbnail with play button
                                <motion.div
                                    className="absolute inset-0 pt-12 cursor-pointer group"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    {/* YouTube thumbnail - Use YouTube's maxresdefault with fallback */}
                                    <div
                                        className="absolute inset-0 pt-12 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(/hero-showcase.png)`,
                                        }}
                                    >
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors duration-300" />
                                    </div>

                                    {/* Play button */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <motion.div
                                            className="relative"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 0 0 rgba(251, 146, 60, 0.4)',
                                                    '0 0 0 20px rgba(251, 146, 60, 0)',
                                                ]
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/50 group-hover:shadow-xl group-hover:shadow-orange-500/60 transition-shadow duration-300">
                                                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Watch text */}
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                        <span className="text-white/80 text-sm font-medium bg-slate-900/60 backdrop-blur-sm px-4 py-2 rounded-full">
                                            {t('watch_now')}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                // YouTube embed
                                <iframe
                                    className="absolute inset-0 w-full h-full pt-12"
                                    src={`https://www.youtube.com/embed/${siteConfig.demoVideoUrl}?autoplay=1&rel=0&modestbranding=1`}
                                    title="LexiVocab Demo Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
