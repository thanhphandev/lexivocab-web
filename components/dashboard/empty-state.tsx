"use client";

import { LucideIcon, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

interface EmptyStateProps {
    icon?: LucideIcon;
    illustration?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon: Icon = SearchX,
    illustration,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card/50 rounded-2xl border border-dashed border-muted-foreground/20 shadow-inner"
        >
            {illustration ? (
                <div className="mb-6">
                    <Image
                        src={illustration}
                        alt={title}
                        width={200}
                        height={200}
                        className="mx-auto opacity-90 dark:opacity-80"
                        priority={false}
                    />
                </div>
            ) : (
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                    <Icon className="h-10 w-10 text-muted-foreground/40" />
                </div>
            )}
            <h3 className="text-lg font-bold text-foreground mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <Button 
                    onClick={action.onClick}
                    variant="outline"
                    className="rounded-xl h-10 px-6 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
}
