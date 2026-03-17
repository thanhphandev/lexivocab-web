"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

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
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

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
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-6">
                    <DialogHeader className="flex-row items-start gap-4 space-y-0">
                        <div className={`p-3 rounded-full ${variant === "destructive" ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"}`}>
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                            <DialogDescription className="text-sm leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-4 bg-muted/40 border-t flex justify-end gap-3 rounded-b-xl">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-10 px-4"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        className="rounded-xl h-10 px-6 font-bold shadow-sm"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {confirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
