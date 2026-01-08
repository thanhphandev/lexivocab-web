'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    label: string;
    images: File[];
    previewUrls: string[];
    onFilesAdd: (files: File[]) => void;
    onFileRemove: (index: number) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    placeholder?: string;
}

export function ImageUpload({
    label,
    images,
    previewUrls,
    onFilesAdd,
    onFileRemove,
    maxFiles = 5,
    maxSizeMB = 5,
    placeholder = 'Drop images here or click to upload'
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        processFiles(files);
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
    };

    const processFiles = (files: File[]) => {
        const availableSlots = maxFiles - images.length;
        if (availableSlots <= 0) return;

        const validFiles = files
            .filter(file => file.type.startsWith('image/') && file.size <= maxSizeMB * 1024 * 1024)
            .slice(0, availableSlots);

        if (validFiles.length > 0) {
            onFilesAdd(validFiles);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <span className="text-xs text-gray-400">{images.length}/{maxFiles}</span>
            </div>

            {images.length < maxFiles && (
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed border-gray-200 rounded-xl p-6",
                        "flex flex-col items-center justify-center cursor-pointer",
                        "hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200",
                        "group min-h-[100px]"
                    )}
                >
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-orange-100 transition-colors mb-3">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-gray-700 text-center">
                        {placeholder}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max {maxSizeMB}MB per file</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleSelect}
                    />
                </motion.div>
            )}

            {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {previewUrls.map((url, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button
                                type="button"
                                onClick={() => onFileRemove(index)}
                                className={cn(
                                    "absolute top-1 right-1 p-1.5 rounded-full",
                                    "bg-black/50 backdrop-blur-sm text-white",
                                    "hover:bg-red-500 transition-all",
                                    "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                                )}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
