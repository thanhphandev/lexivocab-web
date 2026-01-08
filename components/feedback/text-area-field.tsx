'use client';

import { cn } from '@/lib/utils';

interface TextAreaFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
}

export function TextAreaField({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    rows = 4
}: TextAreaFieldProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                rows={rows}
                className={cn(
                    "w-full p-4 rounded-xl resize-none",
                    "border-2 border-gray-100 bg-gray-50/50",
                    "focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100",
                    "transition-all duration-200 text-sm outline-none",
                    "placeholder:text-gray-400"
                )}
                placeholder={placeholder}
            />
        </div>
    );
}
