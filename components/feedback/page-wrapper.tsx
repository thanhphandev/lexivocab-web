'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
            {/* Modern Mesh Gradient Background */}
            <div className="absolute inset-0 -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-amber-50/30" />

                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-20 left-[10%] w-[400px] h-[400px] rounded-full opacity-60"
                    style={{
                        background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-[10%] w-[350px] h-[350px] rounded-full opacity-60"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
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
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            <div className="w-full max-w-2xl z-10 my-8 md:my-12">
                {children}
            </div>
        </div>
    );
}
