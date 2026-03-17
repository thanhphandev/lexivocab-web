"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Loader2, Volume2, BookOpen, ExternalLink, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { masterVocabApi, vocabularyApi } from "@/lib/api/api-client";
import type { MasterVocabularyLookupDto } from "@/lib/api/types";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplorePage() {
    const t = useTranslations("Dashboard.explore");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<MasterVocabularyLookupDto[]>([]);
    const [selectedWord, setSelectedWord] = useState<MasterVocabularyLookupDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Debounced search for suggestions
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const res = await masterVocabApi.search(searchQuery);
            if (res.success) {
                setSuggestions(res.data);
            }
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = async (word: MasterVocabularyLookupDto) => {
        setIsLoading(true);
        setSelectedWord(word);
        setSearchQuery("");
        setSuggestions([]);
        
        // Fetch full details if needed (our lookup currently returns the same as search for consistency)
        const res = await masterVocabApi.lookup(word.wordText);
        if (res.success) {
            setSelectedWord(res.data);
        }
        setIsLoading(false);
    };

    const handleAddToVocab = async () => {
        if (!selectedWord) return;
        setIsAdding(true);
        const res = await vocabularyApi.create({
            wordText: selectedWord.wordText,
            customMeaning: selectedWord.meaning,
        });
        if (res.success) {
            // Show success toast or update state
            alert(`Added "${selectedWord.wordText}" to your vocabulary!`);
        }
        setIsAdding(false);
    };

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Audio play failed", e));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-10 h-12 text-lg shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-popover border rounded-lg shadow-xl overflow-hidden"
                        >
                            {suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    className="w-full px-4 py-3 text-left hover:bg-accent flex justify-between items-center transition-colors"
                                    onClick={() => handleSelect(item)}
                                >
                                    <div>
                                        <span className="font-semibold text-foreground">{item.wordText}</span>
                                        <span className="ml-3 text-sm text-muted-foreground line-clamp-1 italic">
                                            {item.meaning}
                                        </span>
                                    </div>
                                    {item.cefrLevel && (
                                        <Badge variant="outline" className="ml-2 uppercase text-[10px]">
                                            {item.cefrLevel}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <main className="min-h-[400px]">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-1/3" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : selectedWord ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-premium bg-gradient-to-br from-card to-accent/5 overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-4xl font-extrabold">{selectedWord.wordText}</CardTitle>
                                            {selectedWord.cefrLevel && (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                                    {selectedWord.cefrLevel}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground">
                                            {selectedWord.phoneticUs && (
                                                <button 
                                                    onClick={() => selectedWord.audioUrl && playAudio(selectedWord.audioUrl)}
                                                    className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                                                >
                                                    <span className="font-medium">US: /{selectedWord.phoneticUs}/</span>
                                                    {selectedWord.audioUrl && <Volume2 className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                                                </button>
                                            )}
                                            {selectedWord.phoneticUk && (
                                                <span className="font-medium">UK: /{selectedWord.phoneticUk}/</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button size="lg" onClick={handleAddToVocab} disabled={isAdding} className="gap-2 shadow-sm">
                                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        {t("addToVocab")}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                                        <BookOpen className="h-4 w-4" />
                                        {t("meanings")}
                                    </div>
                                    <p className="text-xl leading-relaxed text-foreground/90 font-medium">
                                        {selectedWord.meaning}
                                    </p>
                                </div>

                                <div className="pt-4 border-t flex flex-wrap gap-4">
                                    <Button variant="outline" size="sm" className="gap-2" asChild>
                                        <a href={`https://dictionary.cambridge.org/dictionary/english/${selectedWord.wordText}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Cambridge
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2" asChild>
                                        <a href={`https://www.oxfordlearnersdictionaries.com/definition/english/${selectedWord.wordText}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Oxford
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
                        <div className="p-4 rounded-full bg-accent/30">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">{t("startTyping")}</h3>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
