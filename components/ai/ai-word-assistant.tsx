"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { QuickModelSwitcher } from "./quick-model-switcher";
import { useAiExplain } from "./hooks/use-ai-explain";
import { useAiRelated } from "./hooks/use-ai-related";
import { useAiQuiz } from "./hooks/use-ai-quiz";
import { useAiStory } from "./hooks/use-ai-story";

import { ExplainTab } from "./tabs/explain-tab";
import { RelatedTab } from "./tabs/related-tab";
import { QuizTab } from "./tabs/quiz-tab";
import { StoryTab } from "./tabs/story-tab";

interface AIWordAssistantProps {
    word: string;
    context?: string;
    isOpen: boolean;
    onClose: () => void;
    provider?: string;
    modelId?: string;
    onProviderChange?: (val: string) => void;
}

export function AIWordAssistant({ word, context, isOpen, onClose, provider, modelId, onProviderChange }: AIWordAssistantProps) {
    const t = useTranslations("AI");
    const [activeTab, setActiveTab] = useState("explain");

    // Internal provider fallback if not passed via props
    const [localAiProvider, setLocalAiProvider] = useState("");
    const [localAiProviderName, setLocalAiProviderName] = useState("");

    const activeModelId = modelId || localAiProvider;
    // We strictly use the resolved provider name because default splitting by '/' fails for cases like openrouter/qwen/...
    const activeProvider = provider || localAiProviderName || activeModelId.split('/')[0];

    // Refs for scrolling
    const explainScrollRef = useRef<HTMLDivElement>(null);
    const storyScrollRef = useRef<HTMLDivElement>(null);

    // AI Hooks logic
    const { isStreaming, streamingContent, explainError, startStreaming, stopStreaming } = useAiExplain(word, context);
    const { isStoryStreaming, storyStreamingContent, storyError, startStoryStreaming, stopStoryStreaming } = useAiStory(word);
    const { related, isLoadingRelated, relatedError, fetchRelated, setRelated } = useAiRelated(word);
    const { quiz, isLoadingQuiz, selectedOption, isCorrect, quizError, fetchQuiz, setQuiz, handleAnswer } = useAiQuiz(word);

    // Auto-scroll logic via useEffect
    useEffect(() => {
        if (isStreaming && explainScrollRef.current) {
            explainScrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [streamingContent, isStreaming]);

    useEffect(() => {
        if (isStoryStreaming && storyScrollRef.current) {
            storyScrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [storyStreamingContent, isStoryStreaming]);

    // Triggers logic corresponding to tab selection
    useEffect(() => {
        if (isOpen && word && activeModelId && localAiProviderName) {
            if (activeTab === "explain" && !streamingContent) {
                startStreaming(activeModelId, activeProvider);
            } else if (activeTab === "related" && !related) {
                fetchRelated(activeModelId, activeProvider);
            } else if (activeTab === "quiz" && !quiz) {
                fetchQuiz(activeModelId, activeProvider);
            } else if (activeTab === "story" && !storyStreamingContent) {
                startStoryStreaming(activeModelId, activeProvider);
            }
        }

        return () => {
            stopStreaming();
            stopStoryStreaming();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, word, activeTab, activeModelId, localAiProviderName]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md md:max-w-xl flex flex-col p-0 gap-0 h-full">
                <SheetHeader className="p-6 border-b bg-card">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Brain className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] uppercase font-bold tracking-wider">
                                {t("tags.assistant")}
                            </Badge>
                        </div>
                        {(!provider || !modelId) && (
                            <QuickModelSwitcher
                                provider={localAiProvider}
                                setProvider={(val) => {
                                    setLocalAiProvider(val);
                                    if (onProviderChange) onProviderChange(val);
                                }}
                                onProviderResolved={setLocalAiProviderName}
                                isStreaming={isStreaming || isStoryStreaming || isLoadingQuiz || isLoadingRelated}
                                disabled={isStreaming || isStoryStreaming || isLoadingQuiz || isLoadingRelated}
                                onTriggerAi={(triggerModelId, triggerProvider) => {
                                    if (activeTab === 'explain') startStreaming(triggerModelId, triggerProvider);
                                    else if (activeTab === 'story') startStoryStreaming(triggerModelId, triggerProvider);
                                    else if (activeTab === 'related') { setRelated(null); fetchRelated(triggerModelId, triggerProvider); }
                                    else if (activeTab === 'quiz') { setQuiz(null); fetchQuiz(triggerModelId, triggerProvider); }
                                }}
                            />
                        )}
                    </div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2 mt-2">
                        {word}
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    </SheetTitle>
                    <SheetDescription className="line-clamp-1 italic">
                        {context && `"${context}"`}
                    </SheetDescription>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="w-full border-b bg-muted/30 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <TabsList className="flex w-max rounded-none h-auto gap-2 bg-transparent justify-start p-0 px-4 py-3">
                            <TabsTrigger value="explain" className="flex items-center gap-2 shrink-0 rounded-full px-4 py-2 border border-transparent data-[state=active]:border-border bg-muted/50 hover:bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <BookOpen className="h-4 w-4" />
                                {t("tabs.explain") || "Giải thích"}
                            </TabsTrigger>
                            <TabsTrigger value="related" className="flex items-center gap-2 shrink-0 rounded-full px-4 py-2 border border-transparent data-[state=active]:border-border bg-muted/50 hover:bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Sparkles className="h-4 w-4" />
                                {t("tabs.related") || "Liên quan"}
                            </TabsTrigger>
                            <TabsTrigger value="quiz" className="flex items-center gap-2 shrink-0 rounded-full px-4 py-2 border border-transparent data-[state=active]:border-border bg-muted/50 hover:bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <HelpCircle className="h-4 w-4" />
                                {t("tabs.quiz") || "Câu đố"}
                            </TabsTrigger>
                            <TabsTrigger value="story" className="flex items-center gap-2 shrink-0 rounded-full px-4 py-2 border border-transparent data-[state=active]:border-border bg-muted/50 hover:bg-muted data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                {t("tabs.story") || "Story"}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <TabsContent value="explain" key="explain" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                <ExplainTab
                                    isStreaming={isStreaming}
                                    streamingContent={streamingContent}
                                    explainError={explainError}
                                    startStreaming={() => startStreaming(activeModelId, activeProvider)}
                                    stopStreaming={stopStreaming}
                                    explainScrollRef={explainScrollRef}
                                />
                            </TabsContent>

                            <TabsContent value="related" key="related" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                <RelatedTab
                                    isLoadingRelated={isLoadingRelated}
                                    related={related}
                                    relatedError={relatedError}
                                    fetchRelated={() => fetchRelated(activeModelId, activeProvider)}
                                />
                            </TabsContent>

                            <TabsContent value="quiz" key="quiz" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                <QuizTab
                                    isLoadingQuiz={isLoadingQuiz}
                                    quiz={quiz}
                                    quizError={quizError}
                                    selectedOption={selectedOption}
                                    isCorrect={isCorrect}
                                    fetchQuiz={() => fetchQuiz(activeModelId, activeProvider)}
                                    handleAnswer={handleAnswer}
                                />
                            </TabsContent>

                            <TabsContent value="story" key="story" className="absolute inset-0 overflow-y-auto p-6 m-0 outline-none">
                                <StoryTab
                                    isStoryStreaming={isStoryStreaming}
                                    storyStreamingContent={storyStreamingContent}
                                    storyError={storyError}
                                    startStoryStreaming={() => startStoryStreaming(activeModelId, activeProvider)}
                                    stopStoryStreaming={stopStoryStreaming}
                                    storyScrollRef={storyScrollRef}
                                />
                            </TabsContent>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
