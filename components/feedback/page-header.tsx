'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    icon: LucideIcon;
    iconColor?: 'orange' | 'red' | 'blue' | 'green';
    title: string;
    subtitle: string;
}

const colorVariants = {
    orange: 'bg-orange-100/80 ring-orange-200/60 text-orange-600',
    red: 'bg-red-100/80 ring-red-200/60 text-red-600',
    blue: 'bg-blue-100/80 ring-blue-200/60 text-blue-600',
    green: 'bg-green-100/80 ring-green-200/60 text-green-600',
};

export function PageHeader({ icon: Icon, iconColor = 'orange', title, subtitle }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center space-y-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={cn(
                    "inline-flex items-center justify-center p-4 rounded-2xl ring-1 shadow-lg",
                    colorVariants[iconColor]
                )}
            >
                <Icon className="w-7 h-7" strokeWidth={1.8} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
            >
                {title}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed"
            >
                {subtitle}
            </motion.p>
        </motion.div>
    );
}
