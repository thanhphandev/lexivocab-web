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
import { Button } from "@/components/ui/button";

interface SepayQRDialogProps {
    qrData: { url: string; ref: string; expiresAt?: string | null } | null;
    onOpenChange: (open: boolean) => void;
    onCreateNew?: () => void | Promise<void>;
    onRefresh?: () => void;
}

function formatSeconds(totalSeconds: number) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export function SepayQRDialog({ qrData, onOpenChange, onCreateNew, onRefresh }: SepayQRDialogProps) {
    const t = useTranslations("Pricing");
    const [imageError, setImageError] = useState(false);
    const [now, setNow] = useState(Date.now());

    const expiresAtMs = qrData?.expiresAt ? new Date(qrData.expiresAt).getTime() : null;
    const secondsLeft = expiresAtMs ? Math.ceil((expiresAtMs - now) / 1000) : null;
    const isExpired = expiresAtMs ? expiresAtMs <= now : false;

    // Reset error state when qrData changes
    useEffect(() => {
        if (qrData) {
            setImageError(false);
            setNow(Date.now());
        }
    }, [qrData]);

    // Realtime countdown
    useEffect(() => {
        if (!qrData?.expiresAt) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [qrData?.expiresAt]);

    const handleCreateNew = async () => {
        if (onCreateNew) {
            await onCreateNew();
            return;
        }
        onOpenChange(false);
        window.location.reload();
    };

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
            return;
        }
        window.location.reload();
    };

    return (
        <Dialog open={!!qrData} onOpenChange={(open) => {
            if (!open) setImageError(false);
            onOpenChange(open);
        }}>
            <DialogContent 
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-center">{t("method_sepay")}</DialogTitle>
                    <DialogDescription className="text-center">
                        {t("payment_notice")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-6">
                    {qrData && (
                        <div className="bg-card p-4 rounded-2xl shadow-inner border min-h-[256px] flex items-center justify-center">
                            {isExpired ? (
                                <div className="w-64 h-64 flex items-center justify-center bg-muted/50 rounded-lg text-destructive font-medium text-sm p-4 text-center">
                                    {t("qr_modal.expired")}
                                </div>
                            ) : !imageError ? (
                                <img 
                                    src={qrData.url} 
                                    alt="VietQR" 
                                    className="w-64 h-64 object-contain"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center bg-muted/50 rounded-lg text-destructive font-medium text-sm p-4 text-center">
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
                        {qrData?.expiresAt && (
                            <p className="text-xs text-muted-foreground">
                                {t("qr_modal.expires_label")}{" "}
                                <span className="font-mono">
                                    {new Date(qrData.expiresAt).toLocaleString()}{" "}
                                    {secondsLeft !== null && !isExpired ? `(${t("qr_modal.time_left")} ${formatSeconds(secondsLeft)})` : ""}
                                </span>
                            </p>
                        )}
                    </div>
                    {!isExpired ? (
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">{t("qr_modal.waiting")}</span>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-2">
                            <Button onClick={handleCreateNew} className="w-full">
                                {t("qr_modal.create_new")}
                            </Button>
                            <Button onClick={handleRefresh} variant="outline" className="w-full">
                                {t("qr_modal.refresh")}
                            </Button>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                        {t("qr_modal.instruction")}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
