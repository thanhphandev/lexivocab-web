'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'url';
    icon?: LucideIcon;
    required?: boolean;
}

export function InputField({
    id,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon: Icon,
    required = false
}: InputFieldProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className={cn(
                        "w-full p-3 rounded-xl",
                        Icon ? "pl-12" : "pl-4",
                        "border-2 border-gray-100 bg-gray-50/50",
                        "focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100",
                        "transition-all duration-200 text-sm outline-none",
                        "placeholder:text-gray-400"
                    )}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
