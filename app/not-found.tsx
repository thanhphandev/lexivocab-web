'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react';

// Floating vocabulary words for the animation
const floatingWords = [
    { word: 'serendipity', translation: 'sự tình cờ may mắn', delay: 0 },
    { word: 'ephemeral', translation: '短暂的', delay: 0.5 },
    { word: 'wanderlust', translation: '旅行欲', delay: 1 },
    { word: 'mellifluous', translation: 'êm tai', delay: 1.5 },
    { word: 'petrichor', translation: 'mùi đất sau mưa', delay: 2 },
    { word: 'luminous', translation: '発光する', delay: 2.5 },
];

export default function NotFoundPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
            {/* Animated background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Floating vocabulary words */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingWords.map((item, index) => (
                    <motion.div
                        key={index}
                        className="absolute text-white/10 font-mono text-sm md:text-base"
                        initial={{
                            x: `${(index * 15) + 5}%`,
                            y: '110%',
                            rotate: -15 + (index * 5),
                        }}
                        animate={{
                            y: '-10%',
                            rotate: 15 - (index * 5),
                        }}
                        transition={{
                            duration: 20 + (index * 2),
                            repeat: Infinity,
                            delay: item.delay,
                            ease: "linear",
                        }}
                    >
                        <span className="block">{item.word}</span>
                        <span className="block text-xs opacity-50">{item.translation}</span>
                    </motion.div>
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
                {/* 404 Number with book animation */}
                <motion.div
                    className="mb-8 relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                >
                    {/* Glowing effect behind 404 */}
                    <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-violet-600/30 via-orange-500/30 to-violet-600/30 animate-pulse" />

                    <div className="relative flex items-center justify-center gap-4">
                        <motion.span
                            className="text-8xl md:text-[12rem] font-bold bg-gradient-to-br from-violet-400 via-orange-400 to-violet-400 bg-clip-text text-transparent drop-shadow-2xl"
                            animate={{ rotateY: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            4
                        </motion.span>

                        {/* Animated book icon in the middle */}
                        <motion.div
                            className="relative"
                            animate={{
                                y: [0, -10, 0],
                                rotateZ: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <BookOpen className="h-24 w-24 md:h-40 md:w-40 text-orange-400 drop-shadow-xl" strokeWidth={1.5} />
                            {/* Page flip effect */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Search className="h-8 w-8 md:h-12 md:w-12 text-white/50" />
                            </motion.div>
                        </motion.div>

                        <motion.span
                            className="text-8xl md:text-[12rem] font-bold bg-gradient-to-br from-violet-400 via-orange-400 to-violet-400 bg-clip-text text-transparent drop-shadow-2xl"
                            animate={{ rotateY: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                        >
                            4
                        </motion.span>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="mb-4 text-2xl md:text-4xl font-bold text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Oops! This page got lost in translation
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="mb-8 max-w-md text-base md:text-lg text-white/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    The page you&apos;re looking for doesn&apos;t exist or has been moved. But hey, at least you learned a new word today!
                </motion.p>

                {/* "Word of the day" card */}
                <motion.div
                    className="mb-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                    <div className="text-xs uppercase tracking-wider text-orange-400/80 mb-2">
                        Word of the moment
                    </div>
                    <div className="text-2xl font-serif italic text-white mb-1">
                        lost
                    </div>
                    <div className="text-sm text-white/50 mb-3">
                        /lɔːst/
                    </div>
                    <div className="text-white/70 text-sm">
                        Unable to find one&apos;s way; not knowing where you are or how to get to where you want to go.
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105"
                    >
                        <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
                        Go to Homepage
                    </Link>

                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.history.back();
                            }
                        }}
                        className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>
                </motion.div>

                {/* Fun stats */}
                <motion.div
                    className="mt-16 grid grid-cols-3 gap-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div>
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-orange-400 bg-clip-text text-transparent">
                            404
                        </div>
                        <div className="text-xs md:text-sm text-white/40">Error Code</div>
                    </div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-violet-400 bg-clip-text text-transparent">
                            ∞
                        </div>
                        <div className="text-xs md:text-sm text-white/40">Words to Learn</div>
                    </div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-orange-400 bg-clip-text text-transparent">
                            1
                        </div>
                        <div className="text-xs md:text-sm text-white/40">Click to Home</div>
                    </div>
                </motion.div>
            </div>

            {/* Decorative grid */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, white 1px, transparent 1px),
                        linear-gradient(to bottom, white 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    );
}
