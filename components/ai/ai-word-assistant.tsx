"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { aiApi } from "@/lib/api/api-client";
import type { WordExplanationDto, RelatedWordsDto, QuizDto } from "@/lib/api/types";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Brain,
    Sparkles,
    BookOpen,
    HelpCircle,
    RotateCcw,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function parsePartialAIJson(raw: string): Partial<WordExplanationDto> {
    if (!raw) return {};
    
    try {
        const fullParsed = JSON.parse(raw);
        if (typeof fullParsed === 'object' && fullParsed !== null) {
            return fullParsed; 
        }
    } catch {
        // Fallback for partial streaming JSON
    }

    const partial: Partial<WordExplanationDto> = {};

    const extractString = (key: string) => {
        const match = raw.match(new RegExp(`"${key}"\\s*:\\s*"([^]*?)(?:"\\s*(?:,|})|$)`));
        if (match) {
            return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        return undefined;
    };

    const extractArray = (key: string) => {
        const contentMatch = raw.match(new RegExp(`"${key}"\\s*:\\s*\\[([^]*?)(?:\\])?(?=\\s*(?:,|}|$))`));
        if (contentMatch) {
            const innerRegex = /"([^]*?)(?:"|$)/g;
            const items: string[] = [];
            let itemMatch;
            while ((itemMatch = innerRegex.exec(contentMatch[1])) !== null) {
                const text = itemMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
                if (text && text !== ',') {
                    items.push(text);
                }
            }
            return items.length > 0 ? items : undefined;
        }
        return undefined;
    };

    partial.explanation = extractString("explanation");
    partial.tip = extractString("tip");
    partial.nuances = extractArray("nuances");
    partial.examples = extractArray("examples");

    return partial;
}

interface AIWordAssistantProps {
    word: string;
    context?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AIWordAssistant({ word, context, isOpen, onClose }: AIWordAssistantProps) {
    const t = useTranslations("AI");
    const [activeTab, setActiveTab] = useState("explain");

    // Explanation State
    const [explanation, setExplanation] = useState<Partial<WordExplanationDto>>({});
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Related State
    const [related, setRelated] = useState<RelatedWordsDto | null>(null);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    // Quiz State
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom of stream
    useEffect(() => {
        if (isStreaming && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [streamingContent, isStreaming]);

    // --- AI Explain Streaming ---
    const startStreaming = async () => {
        if (!word) return;

        // Reset state
        setStreamingContent("");
        setExplanation({});
        setError(null);
        setIsStreaming(true);

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(`/api/proxy/ai/explain-stream?word=${encodeURIComponent(word)}${context ? `&context=${encodeURIComponent(context)}` : ''}&asJson=true`, {
                signal: controller.signal
            });

            if (!response.ok) throw new Error("Failed to connect to AI stream");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No readable stream");

            let done = false;
            let buffer = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: !done });

                    // Parse SSE format
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || ""; // Keep incomplete line

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === "content") {
                                    setStreamingContent(prev => prev + parsed.delta);
                                } else if (parsed.type === "done") {
                                    // Optionally parse the final combined markdown if needed
                                    // but we'll stick to delta for now
                                } else if (parsed.type === "error") {
                                    setError(parsed.message);
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk", e);
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setError(err.message || "An error occurred while streaming AI response");
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsStreaming(false);
            }
        }
    };

    // --- AI Related Words ---
    const fetchRelated = async () => {
        if (related || isLoadingRelated) return;
        setIsLoadingRelated(true);
        const res = await aiApi.getRelated(word);
        if (res.success) setRelated(res.data);
        setIsLoadingRelated(false);
    };

    // --- AI Quiz ---
    const fetchQuiz = async () => {
        setIsLoadingQuiz(true);
        setSelectedOption(null);
        setIsCorrect(null);
        const res = await aiApi.getQuiz(word);
        if (res.success) setQuiz(res.data);
        setIsLoadingQuiz(false);
    };

    useEffect(() => {
        if (isOpen && word) {
            if (activeTab === "explain" && !streamingContent) {
                startStreaming();
            } else if (activeTab === "related" && !related) {
                fetchRelated();
            } else if (activeTab === "quiz" && !quiz) {
                fetchQuiz();
            }
        }

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [isOpen, word, activeTab]);

    const handleAnswer = (index: number) => {
        if (selectedOption !== null || !quiz) return;
        setSelectedOption(index);
        setIsCorrect(index === quiz.correctIndex);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md md:max-w-lg flex flex-col p-0 gap-0 h-full">
                <SheetHeader className="p-6 border-b bg-card">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Brain className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] uppercase font-bold tracking-wider">
                            Lexi AI Assistant
                        </Badge>
                    </div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        {word}
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    </SheetTitle>
                    <SheetDescription className="line-clamp-1 italic">
                        {context && `"${context}"`}
                    </SheetDescription>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="px-6 py-2 border-b bg-muted/30">
                        <TabsList className="grid grid-cols-3 w-full h-10">
                            <TabsTrigger value="explain" className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {t("tabs.explain")}
                            </TabsTrigger>
                            <TabsTrigger value="related" className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                {t("tabs.related")}
                            </TabsTrigger>
                            <TabsTrigger value="quiz" className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                {t("tabs.quiz")}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <TabsContent value="explain" key="explain" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                <div className="space-y-6">
                                    {error ? (
                                        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive flex gap-3 text-sm">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="font-semibold">Error</p>
                                                <p>{error}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={startStreaming}
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-2" />
                                                    Try Again
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative max-w-none">
                                            {(() => {
                                                const partial = parsePartialAIJson(streamingContent);
                                                return (
                                                    <div className="space-y-6">
                                                        {partial.explanation && (
                                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                                                                <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                                                                    <BookOpen className="h-4 w-4" />
                                                                    Explanation
                                                                </div>
                                                                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                                                    {partial.explanation}
                                                                    {isStreaming && (!partial.nuances && !partial.examples && !partial.tip) && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle" />}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {partial.nuances && partial.nuances.length > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                                    Nuances
                                                                </div>
                                                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                                                                    {partial.nuances.map((n, i) => (
                                                                        <li key={i}>{n}</li>
                                                                    ))}
                                                                    {isStreaming && (!partial.examples && !partial.tip) && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 align-middle" />}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {partial.examples && partial.examples.length > 0 && (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                                    Examples
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {partial.examples.map((ex, i) => (
                                                                        <div key={i} className="text-sm italic p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 border-l-4 border-l-blue-400">
                                                                            "{ex}"
                                                                        </div>
                                                                    ))}
                                                                    {isStreaming && !partial.tip && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 mt-2 bg-blue-500 align-middle" />}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {partial.tip && (
                                                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 mt-6 !mt-8">
                                                                <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-[11px]">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    Pro Tip
                                                                </div>
                                                                <div className="text-sm font-medium leading-relaxed">
                                                                    {partial.tip}
                                                                    {isStreaming && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 ml-1 bg-amber-500 align-middle" />}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!partial.explanation && isStreaming && (
                                                            <div className="flex items-center gap-2 text-muted-foreground animate-pulse p-4 text-sm font-medium border rounded-xl border-dashed">
                                                                <Sparkles className="h-4 w-4 text-primary" />
                                                                Analyzing word context...
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            <div ref={scrollRef} />
                                        </div>
                                    )}

                                    {!isStreaming && streamingContent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="pt-6 border-t flex flex-col gap-4"
                                        >
                                            <Button variant="outline" size="sm" onClick={startStreaming} className="w-fit">
                                                <RotateCcw className="h-3 w-3 mr-2" />
                                                Regenerate
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="related" key="related" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                {isLoadingRelated ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm font-medium">Finding synonyms & antonyms...</p>
                                    </div>
                                ) : related ? (
                                    <div className="space-y-8">
                                        {/* Synonyms */}
                                        <section>
                                            <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                Synonyms
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {related.synonyms.map((s, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition-colors border-emerald-500/20">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Antonyms */}
                                        <section>
                                            <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
                                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                Antonyms
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {related.antonyms.map((a, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-colors border-rose-500/20">
                                                        {a}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Collocations */}
                                        <section>
                                            <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                                                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                Collocations
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {related.collocations.map((c, idx) => (
                                                    <div key={idx} className="text-sm p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center gap-2">
                                                        <ChevronRight className="h-3 w-3 text-blue-400" />
                                                        {c}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                ) : null}
                            </TabsContent>

                            <TabsContent value="quiz" key="quiz" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                {isLoadingQuiz ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm font-medium">Generating a mini quiz...</p>
                                    </div>
                                ) : quiz ? (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                            <h4 className="font-semibold text-lg mb-2">{quiz.question}</h4>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Pick the correct usage</p>
                                        </div>

                                        <div className="grid gap-3">
                                            {quiz.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(idx)}
                                                    disabled={selectedOption !== null}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
                                                        selectedOption === null
                                                            ? "hover:border-primary/50 hover:bg-primary/5 bg-background"
                                                            : selectedOption === idx
                                                                ? idx === quiz.correctIndex
                                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                                    : "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                                                : idx === quiz.correctIndex
                                                                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 opacity-60"
                                                                    : "opacity-40 grayscale"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{opt}</span>
                                                        {selectedOption === idx && (
                                                            idx === quiz.correctIndex
                                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                                : <XCircle className="h-5 w-5 text-rose-500" />
                                                        )}
                                                    </div>
                                                    {selectedOption === null && (
                                                        <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {selectedOption !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className={cn(
                                                    "p-4 rounded-xl border flex gap-3",
                                                    isCorrect ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20" : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/20"
                                                )}
                                            >
                                                {isCorrect ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                                                )}
                                                <div className="text-sm">
                                                    <p className="font-bold mb-1">{isCorrect ? "Correct!" : "Not quite..."}</p>
                                                    <p className="text-muted-foreground">{quiz.explanation}</p>
                                                    <Button variant="ghost" size="sm" onClick={fetchQuiz} className="mt-3 px-0 h-auto font-bold hover:bg-transparent">
                                                        <RotateCcw className="h-3 w-3 mr-2" />
                                                        Try another one
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : null}
                            </TabsContent>
                        </AnimatePresence>
                    </div>

                    <div className="p-6 border-t bg-card mt-auto flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        <span>Powered by LexiAI</span>
                        <div className="flex gap-4">
                            <button className="hover:text-primary transition-colors">Feedback</button>
                            <button className="hover:text-primary transition-colors">History</button>
                        </div>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
