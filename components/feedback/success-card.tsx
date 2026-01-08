'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface SuccessCardProps {
    title: string;
    description: string;
    backHomeText: string;
    extraAction?: {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
    };
}

export function SuccessCard({ title, description, backHomeText, extraAction }: SuccessCardProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
        >
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-green-200/40 via-emerald-200/40 to-green-200/40 rounded-3xl blur-2xl" />

                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-green-100/60 shadow-2xl shadow-green-500/10 p-8 md:p-12">
                    {/* Success icon with animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="relative mx-auto w-24 h-24 mb-6"
                    >
                        {/* Outer ring pulse */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-green-100"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        {/* Inner circle */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                        {/* Sparkles */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2"
                        >
                            <Sparkles className="absolute top-0 right-0 w-4 h-4 text-amber-400" />
                            <Sparkles className="absolute bottom-2 left-0 w-3 h-3 text-orange-400" />
                        </motion.div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 mb-3"
                    >
                        {title}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed"
                    >
                        {description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center"
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full border-gray-200 hover:bg-gray-50 px-6 font-medium"
                            onClick={() => router.push('/')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {backHomeText}
                        </Button>

                        {extraAction && (
                            <Button
                                size="lg"
                                className="rounded-full font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 px-6"
                                onClick={extraAction.onClick}
                            >
                                {extraAction.icon || <RefreshCw className="mr-2 h-4 w-4" />}
                                {extraAction.label}
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
