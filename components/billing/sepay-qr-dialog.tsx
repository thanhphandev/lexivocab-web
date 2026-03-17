"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface SepayQRDialogProps {
    qrData: { url: string; ref: string } | null;
    onOpenChange: (open: boolean) => void;
}

export function SepayQRDialog({ qrData, onOpenChange }: SepayQRDialogProps) {
    const t = useTranslations("Pricing");
    const [imageError, setImageError] = useState(false);

    // Reset error state when qrData changes
    useEffect(() => {
        if (qrData) {
            setImageError(false);
        }
    }, [qrData]);

    return (
        <Dialog open={!!qrData} onOpenChange={(open) => {
            if (!open) setImageError(false);
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">{t("method_sepay")}</DialogTitle>
                    <DialogDescription className="text-center">
                        {t("payment_notice")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-6">
                    {qrData && (
                        <div className="bg-white p-4 rounded-2xl shadow-inner border min-h-[256px] flex items-center justify-center">
                            {!imageError ? (
                                <img 
                                    src={qrData.url} 
                                    alt="VietQR" 
                                    className="w-64 h-64 object-contain"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg text-red-500 text-sm p-4 text-center">
                                    {t("qr_modal.error")}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t("qr_modal.reference_label")}
                        </p>
                        <p className="text-xl font-mono font-bold tracking-wider text-primary">
                            {qrData?.ref}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{t("qr_modal.waiting")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        {t("qr_modal.instruction")}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
