'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
    message: string | null;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-red-100">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm text-red-700 font-medium">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
