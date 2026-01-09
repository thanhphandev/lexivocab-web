'use client';

import { motion } from 'framer-motion';
import { LucideIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
    id: string;
    icon: LucideIcon;
    label: string;
}

interface OptionSelectorProps {
    options: Option[];
    selected: string | null;
    onSelect: (id: string) => void;
    columns?: 2 | 3;
}

export function OptionSelector({ options, selected, onSelect, columns = 2 }: OptionSelectorProps) {
    const gridCols = columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

    return (
        <div className={cn("grid gap-3", gridCols)}>
            {options.map((option, index) => (
                <motion.button
                    key={option.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(option.id)}
                    className={cn(
                        "group relative flex items-center p-4 rounded-xl border-2 transition-all duration-200",
                        selected === option.id
                            ? "border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md shadow-orange-500/10"
                            : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm"
                    )}
                >
                    <div className={cn(
                        "p-2.5 rounded-xl mr-4 transition-all duration-200",
                        selected === option.id
                            ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20"
                            : "bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                    )}>
                        <option.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                        "font-medium text-sm transition-colors text-left",
                        selected === option.id
                            ? "text-orange-700"
                            : "text-gray-600 group-hover:text-gray-800"
                    )}>
                        {option.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
