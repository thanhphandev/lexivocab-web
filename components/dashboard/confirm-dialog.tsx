"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => Promise<void> | void;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "default";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText,
    cancelText,
    variant = "destructive",
}: ConfirmDialogProps) {
    const t = useTranslations("Modal");
    const [isLoading, setIsLoading] = useState(false);

    const finalConfirmText = confirmText || t("confirm");
    const finalCancelText = cancelText || t("cancel");

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-105 p-0 overflow-hidden border-none shadow-lg">
                <div className="p-6">
                    <DialogHeader className="flex-row items-start gap-4 space-y-0">
                        <div className={`p-3 rounded-full shrink-0 ${variant === "destructive" ? "bg-red-500/10 text-red-600 dark:bg-red-950/30 dark:text-red-400" : "bg-amber-500/10 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"}`}>
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <DialogTitle className="text-lg font-bold leading-tight">{title}</DialogTitle>
                            <DialogDescription className="text-sm leading-relaxed text-foreground/80">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4 bg-muted/40 dark:bg-background/50 border-t flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-10 px-4 font-medium"
                        disabled={isLoading}
                    >
                        {finalCancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        className="rounded-lg h-10 px-6 font-bold shadow-sm"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {finalConfirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
