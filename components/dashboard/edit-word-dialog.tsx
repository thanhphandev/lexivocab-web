"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { clientApi, settingsApi } from "@/lib/api/api-client";
import type { VocabularyDto } from "@/lib/api/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { QuickModelSwitcher } from "@/components/ai/quick-model-switcher";
import { useLLMTranslation } from "@/hooks/use-llm-translation";
import { showErrorToast } from "@/lib/error-handler";

interface EditWordDialogProps {
    item: VocabularyDto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditWordDialog({ item, open, onOpenChange, onSuccess }: EditWordDialogProps) {
    const t = useTranslations("Dashboard.vocabulary.editWordDialog");
    const tErrors = useTranslations("errors");
    const [isLoading, setIsLoading] = useState(false);

    const [customMeaning, setCustomMeaning] = useState(item.customMeaning || "");
    const [contextSentence, setContextSentence] = useState(item.contextSentence || "");
    const [sourceUrl, setSourceUrl] = useState(item.sourceUrl || "");

    const [aiProvider, setAiProvider] = useState("");
    const [aiProviderName, setAiProviderName] = useState("");
    const { isStreaming, aiData, streamingError, streamTranslation } = useLLMTranslation();
    const [isSwapped, setIsSwapped] = useState(false);
    const [settings, setSettings] = useState<{ nativeLanguage?: string; targetLanguage?: string } | null>(null);

    useEffect(() => {
        if (open && !settings) {
            settingsApi.get().then((res) => {
                if (res.success && res.data) setSettings(res.data);
            }).catch(console.error);
        }
    }, [open, settings]);

    useEffect(() => {
        if (aiData.meaning) setCustomMeaning(aiData.meaning);
        if (aiData.context) setContextSentence(aiData.context);
    }, [aiData.meaning, aiData.context]);

    const handleAiAutofill = (modelId: string = aiProvider, trueProvider?: string) => {
        let fromLang = "auto";
        let toLang = "auto";

        if (settings) {
            if (isSwapped) {
                fromLang = settings.nativeLanguage || "vi";
                toLang = settings.targetLanguage || "en";
            } else {
                fromLang = "auto";
                toLang = settings.nativeLanguage || "vi";
            }
        }

        const resolvedProvider = trueProvider || aiProviderName || modelId.split("/")[0];
        streamTranslation(item.wordText, "", resolvedProvider, modelId, fromLang, toLang);
    };

    useEffect(() => {
        if (open) {
            setCustomMeaning(item.customMeaning || "");
            setContextSentence(item.contextSentence || "");
            setSourceUrl(item.sourceUrl || "");
        }
    }, [item, open]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const res = await clientApi.put(`/api/proxy/vocabularies/${item.id}`, {
                customMeaning: customMeaning.trim() || null,
                contextSentence: contextSentence.trim() || null,
                sourceUrl: sourceUrl.trim() || null,
            });

            if (res.success) {
                onOpenChange(false);
                onSuccess();
            } else {
                showErrorToast(res, t("failed"), tErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>
                            {t("desc", { word: item.wordText })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editCustomMeaning">
                                    {t("meaningLabel")} <span className="text-muted-foreground text-xs font-normal">({t("optional")})</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    {settings && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            type="button"
                                            onClick={() => setIsSwapped(!isSwapped)}
                                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                            title="Swap Translation Direction"
                                        >
                                            <ArrowLeftRight className="h-3 w-3 mr-1.5" />
                                            {isSwapped
                                                ? `${(settings.nativeLanguage || 'VI').substring(0, 2).toUpperCase()} → ${(settings.targetLanguage || 'EN').substring(0, 2).toUpperCase()}`
                                                : `Auto → ${(settings.nativeLanguage || 'VI').substring(0, 2).toUpperCase()}`
                                            }
                                        </Button>
                                    )}
                                    <QuickModelSwitcher
                                        provider={aiProvider}
                                        setProvider={setAiProvider}
                                        onProviderResolved={setAiProviderName}
                                        onTriggerAi={handleAiAutofill}
                                        isStreaming={isStreaming}
                                    />
                                </div>
                            </div>
                            <Input
                                id="editCustomMeaning"
                                placeholder={t("meaningPlaceholder")}
                                value={customMeaning}
                                onChange={(e) => setCustomMeaning(e.target.value)}
                            />
                            {streamingError && (
                                <p className="text-destructive text-sm mt-1">{streamingError}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editContextSentence">
                                {t("contextLabel")} <span className="text-muted-foreground text-xs font-normal">({t("optional")})</span>
                            </Label>
                            <Textarea
                                id="editContextSentence"
                                placeholder={t("contextPlaceholder")}
                                value={contextSentence}
                                onChange={(e) => setContextSentence(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editSourceUrl">
                                {t("sourceLabel")} <span className="text-muted-foreground text-xs font-normal">({t("optional")})</span>
                            </Label>
                            <Input
                                id="editSourceUrl"
                                type="url"
                                placeholder={t("sourcePlaceholder")}
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
