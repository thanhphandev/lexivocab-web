'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FormCardProps {
    children: ReactNode;
    onSubmit: (e: React.FormEvent) => void;
}

export function FormCard({ children, onSubmit }: FormCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/50 via-amber-200/50 to-orange-200/50 rounded-3xl blur-xl opacity-60" />

                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-100/60 shadow-xl shadow-orange-500/5 overflow-hidden">
                    {/* Top gradient line */}
                    <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />

                    <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
                        {children}
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
