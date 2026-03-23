"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { clientApi, tagsApi, settingsApi } from "@/lib/api/api-client";
import type { TagDto } from "@/lib/api/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Volume2, ArrowLeftRight } from "lucide-react";
import { QuickModelSwitcher } from "@/components/ai/quick-model-switcher";
import { useLLMTranslation } from "@/hooks/use-llm-translation";
import { showErrorToast } from "@/lib/error-handler";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAddWordSchema, type AddWordInput } from "@/lib/validations/vocabulary";

interface SuggestionResult {
    word: string;
    partOfSpeech?: string;
}

interface LookupResult {
    word: string;
    partOfSpeech?: string;
    audioUrl?: string;
    phoneticUs?: string;
    phoneticUk?: string;
}

interface UserSettings {
    nativeLanguage?: string;
    targetLanguage?: string;
}

export function AddWordDialog({ onSuccess }: { onSuccess: () => void }) {
    const t = useTranslations("Dashboard.vocabulary");
    const tDialog = useTranslations("Dashboard.vocabulary.addWordDialog");
    const tErrors = useTranslations("errors");
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [aiProvider, setAiProvider] = useState("");
    const [aiProviderName, setAiProviderName] = useState("");
    const { isStreaming, aiData, streamingError, streamTranslation } = useLLMTranslation();
    const [isSwapped, setIsSwapped] = useState(false);
    const [settings, setSettings] = useState<UserSettings | null>(null);

    const form = useForm<AddWordInput>({
        resolver: zodResolver(getAddWordSchema(tDialog)),
        defaultValues: {
            wordText: "",
            customMeaning: "",
            contextSentence: "",
            sourceUrl: "",
            tagId: "none",
        }
    });

    const wordText = form.watch("wordText");

    useEffect(() => {
        if (open && !settings) {
            settingsApi.get().then(res => {
                if (res.success && res.data) setSettings(res.data);
            }).catch(console.error);
        }
    }, [open, settings]);

    useEffect(() => {
        if (aiData.meaning) form.setValue("customMeaning", aiData.meaning);
        if (aiData.context) form.setValue("contextSentence", aiData.context);
    }, [aiData.meaning, aiData.context, form]);

    const handleAiAutofill = (modelId: string = aiProvider, trueProvider?: string) => {
        if (!wordText.trim()) return;

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
        streamTranslation(wordText.trim(), "", resolvedProvider, modelId, fromLang, toLang);
    };

    const [tags, setTags] = useState<TagDto[]>([]);

    useEffect(() => {
        if (open) {
            tagsApi.getList().then(res => {
                if (res.success && res.data) setTags(res.data);
            }).catch(console.error);
        }
    }, [open]);

    const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (wordText.trim().length > 1) {
                try {
                    const res = await clientApi.get<SuggestionResult[]>(`/api/proxy/master-vocab/search?q=${wordText}`);
                    if (res.success && res.data) {
                        setSuggestions(res.data);
                        setShowSuggestions(true);
                    }
                } finally {

                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [wordText]);

    const handleSelectSuggestion = async (suggestion: SuggestionResult) => {
        form.setValue("wordText", suggestion.word);
        setShowSuggestions(false);
        form.setValue("customMeaning", "");
        try {
            const res = await clientApi.get<LookupResult>(`/api/proxy/master-vocab/lookup?word=${suggestion.word}`);
            if (res.success && res.data) setLookupResult(res.data);
        } catch (e) {
            console.error("Lookup failed", e);
        }
    };

    const handleSave = async (data: AddWordInput) => {
        if (!data.wordText.trim()) return;

        setIsLoading(true);
        try {
            const res = await clientApi.post("/api/proxy/vocabularies", {
                wordText: data.wordText.trim(),
                customMeaning: data.customMeaning?.trim() || undefined,
                contextSentence: data.contextSentence?.trim() || undefined,
                sourceUrl: data.sourceUrl?.trim() || undefined,
                tagId: data.tagId !== "none" ? data.tagId : undefined,
            });

            if (res.success) {
                setOpen(false);
                form.reset();
                setLookupResult(null);
                onSuccess();
            } else {
                showErrorToast(
                    res,
                    res.errorCode ? tErrors(res.errorCode as Parameters<typeof tErrors>[0]) : tDialog("failed"),
                    tErrors
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const playAudio = () => {
        if (lookupResult?.audioUrl) {
            new Audio(lookupResult.audioUrl).play().catch(console.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button id="add-word-trigger">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addWord")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <form onSubmit={form.handleSubmit(handleSave)}>
                    <DialogHeader>
                        <DialogTitle>{t("addWord")}</DialogTitle>
                        <DialogDescription>{tDialog("desc")}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2 relative">
                            <Label htmlFor="wordText" className={form.formState.errors.wordText ? "text-destructive" : ""}>
                                {tDialog("wordLabel")}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="wordText"
                                    placeholder={tDialog("wordPlaceholder")}
                                    className="pl-9"
                                    autoComplete="off"
                                    {...form.register("wordText")}
                                />
                            </div>
                            {form.formState.errors.wordText && (
                                <p className="text-sm text-destructive">{form.formState.errors.wordText.message}</p>
                            )}

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                                            onClick={() => handleSelectSuggestion(s)}
                                        >
                                            <span className="font-medium">{s.word}</span>
                                            {s.partOfSpeech && (
                                                <span className="text-xs text-muted-foreground italic">{s.partOfSpeech}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {lookupResult && (
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg border flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{lookupResult.word}</span>
                                            {lookupResult.partOfSpeech && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                    {lookupResult.partOfSpeech}
                                                </span>
                                            )}
                                        </div>
                                        {lookupResult.audioUrl && (
                                            <Button type="button" variant="ghost" size="sm" onClick={playAudio} className="h-8 px-2 text-primary">
                                                <Volume2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {(lookupResult.phoneticUs || lookupResult.phoneticUk) && (
                                        <div className="text-sm text-muted-foreground">
                                            {lookupResult.phoneticUs && <span className="mr-3">US: {lookupResult.phoneticUs}</span>}
                                            {lookupResult.phoneticUk && <span>UK: {lookupResult.phoneticUk}</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="customMeaning" className={form.formState.errors.customMeaning ? "text-destructive" : ""}>
                                    {tDialog("meaningLabel")} <span className="text-muted-foreground text-xs font-normal">({tDialog("optional")})</span>
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
                                        isStreaming={isStreaming}
                                        onTriggerAi={handleAiAutofill}
                                        disabled={!wordText.trim()}
                                    />
                                </div>
                            </div>
                            <Input
                                id="customMeaning"
                                placeholder={tDialog("meaningPlaceholder")}
                                {...form.register("customMeaning")}
                            />
                            {form.formState.errors.customMeaning && (
                                <p className="text-sm text-destructive">{form.formState.errors.customMeaning.message}</p>
                            )}
                            {streamingError && (
                                <p className="text-destructive text-sm mt-1">{streamingError}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contextSentence" className={form.formState.errors.contextSentence ? "text-destructive" : ""}>
                                {tDialog("contextLabel")} <span className="text-muted-foreground text-xs font-normal">({tDialog("optional")})</span>
                            </Label>
                            <Textarea
                                id="contextSentence"
                                placeholder={tDialog("contextPlaceholder")}
                                rows={2}
                                {...form.register("contextSentence")}
                            />
                            {form.formState.errors.contextSentence && (
                                <p className="text-sm text-destructive">{form.formState.errors.contextSentence.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sourceUrl" className={form.formState.errors.sourceUrl ? "text-destructive" : ""}>
                                {tDialog("sourceLabel")} <span className="text-muted-foreground text-xs font-normal">({tDialog("optional")})</span>
                            </Label>
                            <Input
                                id="sourceUrl"
                                type="url"
                                placeholder={tDialog("sourcePlaceholder")}
                                {...form.register("sourceUrl")}
                            />
                            {form.formState.errors.sourceUrl && (
                                <p className="text-sm text-destructive">{form.formState.errors.sourceUrl.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagId">
                                {tDialog("tagLabel")} <span className="text-muted-foreground text-xs font-normal">({tDialog("optional")})</span>
                            </Label>
                            <Controller
                                name="tagId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={tDialog("noTag")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{tDialog("noTag")}</SelectItem>
                                            {tags.map((tag) => (
                                                <SelectItem key={tag.id} value={tag.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{tag.icon || "📁"}</span> {tag.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {tDialog("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading || !wordText.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {tDialog("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
