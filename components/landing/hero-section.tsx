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

                    {/* Right Content - Video with enhanced frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                        id="demo-video"
                    >
                        {/* Glow effect behind video */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl transform scale-110 -z-10" />

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-orange-100/50 bg-white">
                            {/* Modern Browser Frame */}
                            <div className="bg-gradient-to-b from-slate-50 to-white px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" />
                                </div>
                                <div className="flex-1 mx-2">
                                    <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 max-w-sm mx-auto">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="font-medium">lexivocab.store</span>
                                    </div>
                                </div>
                            </div>

                            {/* Webpage Content Mockup */}
                            <div className="relative w-full aspect-video bg-white text-left overflow-hidden font-sans select-none p-6 md:p-8">
                                <div className="max-w-[120%] -ml-[10%] -mt-4 text-sm md:text-base leading-relaxed text-slate-800 space-y-4 filter blur-[0.5px]">
                                    <p>
                                        <span className="font-bold">Plants</span> are the <span className="text-blue-600">eukaryotes</span> that comprise the <span className="text-blue-600">kingdom Plantae</span>; they are predominantly <span className="text-blue-600">photosynthetic</span>. This means that they obtain their energy from <span className="text-blue-600">sunlight</span>, using <span className="text-blue-600">chloroplasts</span> derived from <span className="text-blue-600">endosymbiosis</span> with <span className="text-blue-600">cyanobacteria</span> to produce <span className="text-blue-600">sugars</span> from <span className="text-blue-600">carbon dioxide</span> and water, using the green pigment <span className="text-blue-600">chlorophyll</span>. Exceptions are <span className="text-blue-600">parasitic plants</span> that have lost the genes for chlorophyll and <span className="relative inline-block mx-1">
                                            <span className="bg-blue-600 text-white px-1 py-0.5 rounded-sm">photosynthesis</span>

                                            {/* Floating Action Button */}
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 1.5, type: "spring" }}
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white p-1.5 rounded-md shadow-lg shadow-orange-500/30 z-20"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            </motion.div>
                                        </span>, and obtain their energy from other plants or fungi. Most plants are...
                                    </p>
                                    <p>
                                        Historically, the definition of plants encompassed all living things that were not <span className="text-blue-600">animals</span>, and included <span className="text-blue-600">algae</span> and <span className="text-blue-600">fungi</span>; however, all current definitions of kingdom Plantae exclude these organisms. By the definition used in this article, plants form the clade <span className="text-blue-600">Viridiplantae</span> (Latin string for "green plants"), which consists of the <span className="text-blue-600">green algae</span> and the <span className="text-blue-600">embryophytes</span> or <span className="text-blue-600">land plants</span> (hornworts, <span className="text-blue-600">liverworts</span>, <span className="text-blue-600">mosses</span>, <span className="text-blue-600">lycophytes</span>, <span className="text-blue-600">ferns</span>, <span className="text-blue-600">conifers</span> and other <span className="text-blue-600">gymnosperms</span>, and <span className="text-blue-600">flowering plants</span>).
                                    </p>
                                </div>

                                {/* Popup Card Mockup */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white rounded-2xl shadow-2xl shadow-orange-500/20 overflow-hidden z-10 font-sans border border-orange-100"
                                >
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-5 text-white relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-medium text-orange-50 uppercase tracking-wider">Save Word</span>
                                            <button className="text-white/80 hover:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <h3 className="text-xl font-bold">Photosynthesis</h3>
                                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm text-white border border-white/10">Noun</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-orange-50">/ˌfoʊ.təˈsɪn.θə.sɪs/</span>
                                            <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 space-y-4">
                                        {/* Context Quote */}
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-xs text-slate-500 leading-relaxed relative">
                                            <span className="absolute -top-2 left-2 text-3xl text-orange-200 font-serif leading-none">"</span>
                                            Exceptions are parasitic plants that have lost the genes for chlorophyll and photosynthesis, and... obtain their energy from other plants or fungi.
                                            <span className="absolute -bottom-4 right-2 text-3xl text-orange-200 font-serif leading-none rotate-180">"</span>
                                        </div>

                                        {/* Input Section */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meaning</label>
                                                <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    <span>AI</span>
                                                </div>
                                            </div>
                                            <div className="bg-white border rounded-lg p-2.5 text-sm text-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                                                quang hợp
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <Button variant="ghost" className="h-9 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">
                                                Cancel
                                            </Button>
                                            <Button className="h-9 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/25">
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating Card - Extension Info */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 md:-right-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-orange-500/10 p-4 border border-orange-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-inner">
                                    <Image src="/icon.png" alt="LexiVocab" width={28} height={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">LexiVocab</p>
                                    <p className="text-xs text-muted-foreground">Chrome Extension</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Card - Success State */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -bottom-4 -left-4 md:-left-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-green-500/10 p-3 border border-green-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-green-700">{t('saved_word')}</span>
                                    <p className="text-xs text-green-600/70">+1 vocabulary</p>
                                </div>
                            </div>
                        </motion.div>
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
