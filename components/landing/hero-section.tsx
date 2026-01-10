'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Download, Sparkles, Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/config";

// Avatar data with local images
const avatars = [
    { src: '/avatars/avatar-1.png', alt: 'User 1' },
    { src: '/avatars/avatar-2.png', alt: 'User 2' },
    { src: '/avatars/avatar-3.png', alt: 'User 3' },
    { src: '/avatars/avatar-4.png', alt: 'User 4' },
];

export default function HeroSection() {
    const t = useTranslations('Hero');

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Modern Mesh Gradient Background */}
            <div className="absolute inset-0 -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.15),rgba(255,255,255,0))]" />

                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -20, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10 pt-20 md:pt-0">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        {/* Badge with shimmer effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200/60 shadow-sm"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                            </span>
                            <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                {t('badge')}
                            </span>
                        </motion.div>

                        {/* Headline with improved typography */}
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                                {t.rich('title', {
                                    highlight: (chunks) => (
                                        <span className="relative inline-block">
                                            <span className="relative z-10 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                                                {chunks}
                                            </span>
                                            <motion.span
                                                className="absolute -bottom-1 left-0 w-full h-4 bg-gradient-to-r from-orange-200/60 to-amber-200/60 -z-0 rounded-sm"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ delay: 0.8, duration: 0.6 }}
                                                style={{ originX: 0 }}
                                            />
                                        </span>
                                    )
                                })}
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                {t('subtitle')}
                            </p>
                        </div>

                        {/* CTA Buttons with enhanced styles */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer">
                                <Button
                                    size="lg"
                                    className="group h-14 px-8 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-1"
                                >
                                    <Download className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-0.5" />
                                    {t('cta_install')}
                                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                                </Button>
                            </a>
                            <Button
                                variant="outline"
                                size="lg"
                                className="group h-14 px-8 text-lg font-semibold border-2 border-orange-200/80 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
                                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Play className="w-5 h-5 mr-2 text-orange-500 transition-transform group-hover:scale-110" />
                                {t('cta_demo')}
                            </Button>
                        </motion.div>

                        {/* Social Proof - Avatars with real images */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-orange-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {avatars.map((avatar, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + i * 0.1 }}
                                            className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md"
                                        >
                                            <Image
                                                src={avatar.src}
                                                alt={avatar.alt}
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.1 }}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 ring-2 ring-white shadow-md flex items-center justify-center"
                                    >
                                        <span className="text-xs font-bold text-orange-600">+996</span>
                                    </motion.div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">{t('users_count')}</span>
                                    <span className="text-xs text-muted-foreground">Active learners</span>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-orange-200" />

                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.svg
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.8 + i * 0.05 }}
                                            className="w-5 h-5 text-amber-400 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </motion.svg>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">{t('rating')}</span>
                                    <span className="text-xs text-muted-foreground">Chrome Web Store</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Showcase Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative hidden lg:block"
                        id="demo-video"
                    >
                        {/* Glow effect behind image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl transform scale-105 -z-10" />

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-orange-100/50">
                            <Image
                                src="/hero-showcase.png"
                                alt="LexiVocab Showcase"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 rounded-full border-2 border-orange-300 flex items-start justify-center p-2">
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-orange-400"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
}
