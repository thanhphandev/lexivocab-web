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
import type { MasterVocabularyDto } from "@/lib/api/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ExplorePage() {
    const t = useTranslations("Dashboard.explore");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [words, setWords] = useState<MasterVocabularyDto[]>([]);
    const [selectedWord, setSelectedWord] = useState<MasterVocabularyDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounced search for suggestions
    useEffect(() => {
        if (!searchQuery.trim()) {
            setDebouncedSearch("");
            setPage(1);
            return;
        }
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchExploreList = async () => {
            setIsLoading(true);
            const res = await vocabularyApi.getExploreList(page, 20, debouncedSearch);
            if (res.success && res.data) {
                setWords(res.data.items);
                setTotalPages(res.data.totalPages);
            }
            setIsLoading(false);
        };
        fetchExploreList();
    }, [page, debouncedSearch]);

    const handleSelect = (word: MasterVocabularyDto) => {
        setSelectedWord(word);
    };

    const handleAddToVocab = async (word: MasterVocabularyDto) => {
        setIsSaving(true);
        const res = await vocabularyApi.create({
            wordText: word.word,
            customMeaning: word.meaning || undefined,
        });
        if (res.success) {
            toast.success(`Added "${word.word}" to your vocabulary!`);
        } else {
            toast.error(res.error || "Failed to add word.");
        }
        setIsSaving(false);
    };

    const playAudio = (url: string) => {
        if (!url) return;
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
                </div>

                <AnimatePresence>
                    {searchQuery.trim() !== "" && words.length > 0 && !selectedWord && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-popover border rounded-lg shadow-xl overflow-hidden"
                        >
                            {words.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    className="w-full px-4 py-3 text-left hover:bg-accent flex justify-between items-center transition-colors"
                                    onClick={() => handleSelect(item)}
                                >
                                    <div>
                                        <span className="font-semibold text-foreground">{item.word}</span>
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
                {isLoading && !selectedWord ? (
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
                                        <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => setSelectedWord(null)}>
                                            ← Back to Explore
                                        </Button>
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-4xl font-extrabold">{selectedWord.word}</CardTitle>
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
                                    <Button size="lg" onClick={() => handleAddToVocab(selectedWord)} disabled={isSaving} className="gap-2 shadow-sm">
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
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
                                        <a href={`https://dictionary.cambridge.org/dictionary/english/${selectedWord.word}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Cambridge
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2" asChild>
                                        <a href={`https://www.oxfordlearnersdictionaries.com/definition/english/${selectedWord.word}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Oxford
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {words.map((word) => (
                            <Card key={word.id} className="hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/50" onClick={() => handleSelect(word)}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold text-primary">{word.word}</CardTitle>
                                        {word.cefrLevel && (
                                            <Badge variant="outline" className="text-[10px]">{word.cefrLevel}</Badge>
                                        )}
                                    </div>
                                    <CardDescription className="line-clamp-2 text-sm italic">{word.meaning}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-muted-foreground tracking-wider font-mono">
                                            {word.phoneticUs ? `/${word.phoneticUs}/` : ''}
                                        </span>
                                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleAddToVocab(word); }} disabled={isSaving}>
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            
            {!selectedWord && totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>Previous</Button>
                    <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>Next</Button>
                </div>
            )}
        </div>
    );
}
