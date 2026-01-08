'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    label: string;
    value: number | null;
    onChange: (rating: number) => void;
}

export function StarRating({ label, value, onChange }: StarRatingProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 text-center">
                {label}
            </label>
            <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(star)}
                        className="p-1 focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "w-9 h-9 transition-all duration-200",
                                value && star <= value
                                    ? "fill-amber-400 text-amber-400 drop-shadow-md"
                                    : "text-gray-200 hover:text-amber-300"
                            )}
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
