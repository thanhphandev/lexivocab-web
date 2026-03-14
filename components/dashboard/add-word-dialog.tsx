"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { clientApi, tagsApi } from "@/lib/api/api-client";
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
import { Loader2, Plus, Search, Volume2 } from "lucide-react";

export function AddWordDialog({ onSuccess }: { onSuccess: () => void }) {
    const t = useTranslations("Dashboard.vocabulary");
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Form state
    const [wordText, setWordText] = useState("");
    const [customMeaning, setCustomMeaning] = useState("");
    const [contextSentence, setContextSentence] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [tagId, setTagId] = useState<string>("none");

    // Tags state
    const [tags, setTags] = useState<TagDto[]>([]);

    useEffect(() => {
        if (open) {
            tagsApi.getList().then(res => {
                if (res.success && res.data) {
                    setTags(res.data);
                }
            }).catch(console.error);
        }
    }, [open]);

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lookupResult, setLookupResult] = useState<any>(null);

    // Debounced search for autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (wordText.trim().length > 1) {
                setIsSearching(true);
                try {
                    const res = await clientApi.get<any>(`/api/proxy/master-vocab/search?q=${wordText}`);
                    if (res.success) {
                        setSuggestions(res.data);
                        setShowSuggestions(true);
                    }
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [wordText]);

    const handleSelectSuggestion = async (suggestion: any) => {
        setWordText(suggestion.word);
        setShowSuggestions(false);
        setCustomMeaning(""); // Clear existing meaning

        // Fetch full details
        try {
            const res = await clientApi.get<any>(`/api/proxy/master-vocab/lookup?word=${suggestion.word}`);
            if (res.success && res.data) {
                setLookupResult(res.data);
            }
        } catch (e: any) {
            console.error("Lookup failed", e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wordText.trim()) return;

        setIsLoading(true);
        try {
            const res = await clientApi.post("/api/proxy/vocabularies", {
                wordText: wordText.trim(),
                customMeaning: customMeaning.trim() || undefined,
                contextSentence: contextSentence.trim() || undefined,
                sourceUrl: sourceUrl.trim() || undefined,
                tagId: tagId !== "none" ? tagId : undefined,
            });

            if (res.success) {
                setOpen(false);
                // Reset form
                setWordText("");
                setCustomMeaning("");
                setContextSentence("");
                setSourceUrl("");
                setTagId("none");
                setLookupResult(null);
                onSuccess();
            } else {
                alert(res.error || "Failed to add word");
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addWord")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>{t("addWord")}</DialogTitle>
                        <DialogDescription>
                            Type a word to search our dictionary, or add a custom word.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2 relative">
                            <Label htmlFor="wordText">Word</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="wordText"
                                    placeholder="e.g. ubiquitous"
                                    className="pl-9"
                                    value={wordText}
                                    onChange={(e) => setWordText(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            {/* Autocomplete Dropdown */}
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
                                                <span className="text-xs text-muted-foreground italic">
                                                    {s.partOfSpeech}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dropdown Overlay for Suggestions */}
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
                                                <span className="text-xs text-muted-foreground italic">
                                                    {s.partOfSpeech}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dictionary Lookup Result */}
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
                            <Label htmlFor="customMeaning">Meaning / Translation <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                id="customMeaning"
                                placeholder="Add your own definition or translation"
                                value={customMeaning}
                                onChange={(e) => setCustomMeaning(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contextSentence">Context <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Textarea
                                id="contextSentence"
                                placeholder="How is this word used in a sentence?"
                                value={contextSentence}
                                onChange={(e) => setContextSentence(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sourceUrl">Source URL <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                id="sourceUrl"
                                type="url"
                                placeholder="https://..."
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagId">Folder <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Select value={tagId} onValueChange={setTagId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No folder</SelectItem>
                                    {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                            📁 {tag.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !wordText.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Word
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

