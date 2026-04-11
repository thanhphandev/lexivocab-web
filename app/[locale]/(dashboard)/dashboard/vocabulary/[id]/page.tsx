"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  Brain,
  Sparkles,
  Calendar,
  Clock,
  BarChart3,
  ExternalLink,
  BookOpen,
  Lightbulb,
  MessageSquareQuote,
  Zap,
  Tag as TagIcon,
  RefreshCw,
  Trash2,
  ChevronDown,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { vocabularyApi, aiApi, tagsApi } from "@/lib/api/api-client";
import type { VocabularyDto, WordExplanationDto, RelatedWordsDto, TagDto } from "@/lib/api/types";
import { VocabularyDetailSkeleton } from "./_components/vocabulary-detail-skeleton";
import { AIQuizCard } from "./_components/ai-quiz-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function VocabularyDetailPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const t = useTranslations("Dashboard.vocabularyDetail");
  const commonT = useTranslations("Dashboard.vocabulary");

  const [loading, setLoading] = useState(true);
  const [vocab, setVocab] = useState<VocabularyDto | null>(null);
  const [tags, setTags] = useState<Record<string, TagDto>>({});

  // AI State
  const [aiActivated, setAiActivated] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState<WordExplanationDto | null>(null);
  const [related, setRelated] = useState<RelatedWordsDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vocabRes, tagsRes] = await Promise.all([
          vocabularyApi.getById(id as string),
          tagsApi.getList()
        ]);

        if (vocabRes.success) {
          setVocab(vocabRes.data);
        } else {
          toast.error(t("errorNotfound"));
          router.push(`/${locale}/dashboard/vocabulary`);
        }

        if (tagsRes.success) {
          const tagMap = tagsRes.data.reduce((acc, tag) => ({ ...acc, [tag.id]: tag }), {});
          setTags(tagMap);
        }
      } catch (error) {
        console.error("Failed to fetch vocabulary details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchAiInsights = async (word: string, context?: string) => {
    setAiLoading(true);
    try {
      const [explainRes, relatedRes] = await Promise.all([
        aiApi.explain({ word, context }),
        aiApi.getRelated(word)
      ]);

      if (explainRes.success) setExplanation(explainRes.data);
      if (relatedRes.success) setRelated(relatedRes.data);
    } catch (error) {
      console.error("AI Insights fetch failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const playAudio = () => {
    if (vocab?.audioUrl) {
      new Audio(vocab.audioUrl).play().catch(console.error);
    }
  };

  const handleAssignTag = async (tagId: string | null) => {
    if (!vocab) return;
    setActionLoading(true);
    try {
      const res = await vocabularyApi.updateTag(vocab.id, tagId);
      if (res.success) {
        setVocab(prev => prev ? { ...prev, tagId } : null);
        toast.success(commonT("table.assignTagSuccess"));
      } else {
        toast.error(commonT("table.assignTagFailed"));
      }
    } catch (error) {
      toast.error(commonT("table.assignTagFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const activateAi = () => {
    if (!vocab) return;
    setAiActivated(true);
    fetchAiInsights(vocab.wordText, vocab.contextSentence || undefined);
  };

  if (loading) return <VocabularyDetailSkeleton />;
  if (!vocab) return null;

  const currentTag = vocab.tagId ? tags[vocab.tagId] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      {/* Navigation */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">{t("back")}</span>
      </motion.button>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border bg-card/40 backdrop-blur-md shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {currentTag && (
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-1 text-xs font-bold border-primary/20"
                  style={{
                    backgroundColor: `${currentTag.color}15`,
                    color: currentTag.color || undefined,
                    borderColor: `${currentTag.color}30`
                  }}
                >
                  <span className="mr-2">{currentTag.icon}</span>
                  {currentTag.name}
                </Badge>
              )}
              {vocab.partOfSpeech && (
                <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs font-medium uppercase tracking-wider">
                  {vocab.partOfSpeech}
                </Badge>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground break-words">
              {vocab.wordText}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
              {(vocab.phoneticUs || vocab.phoneticUk) && (
                <div className="flex items-center gap-3 font-mono text-lg text-muted-foreground bg-muted/30 px-4 py-2 rounded-2xl">
                  {vocab.phoneticUs || vocab.phoneticUk}
                </div>
              )}
              {vocab.audioUrl && (
                <Button
                  onClick={playAudio}
                  size="icon"
                  className="rounded-full w-14 h-14 bg-primary hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/25"
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("srs.title")}</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((vocab.repetitionCount / 5) * 100, 100)}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-sm font-bold">{Math.min(vocab.repetitionCount, 5)}/5</span>
              </div>
            </div>
            <Badge className="rounded-xl px-4 py-2 text-sm font-bold bg-primary/10 text-primary border-primary/20">
              {commonT(`badges.${vocab.repetitionCount === 0 ? "new" : vocab.repetitionCount >= 5 ? "mastered" : "learning"}`)}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & AI */}
        <div className="lg:col-span-2 space-y-8">
          {/* User's Details */}
          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">{t("meaning")}</h3>
                </div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                  {vocab.customMeaning || <span className="text-muted-foreground italic opacity-50">{commonT("table.noMeaning")}</span>}
                </p>
              </div>

              {vocab.contextSentence && (
                <div className="space-y-3 p-6 rounded-2xl bg-muted/30 border-l-4 border-primary/50 italic">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquareQuote className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">{t("context")}</h3>
                  </div>
                  <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                    &quot;{vocab.contextSentence}&quot;
                  </p>
                </div>
              )}

              {vocab.sourceUrl && (
                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("source")}</span>
                  <a
                    href={vocab.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {new URL(vocab.sourceUrl).hostname}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Section */}
          <div className="space-y-6">
            {!aiActivated ? (
              <Card className="rounded-[2.5rem] border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group cursor-pointer" onClick={activateAi}>
                <CardContent className="p-12 text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black">{t("ai.consultAssistant")}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t("ai.teaserDescription")}
                    </p>
                  </div>
                  <Button size="lg" className="rounded-2xl px-8 font-bold h-14 text-lg shadow-xl shadow-primary/25">
                    <Zap className="mr-2 w-5 h-5 fill-current" />
                    {t("ai.activateNow")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{t("ai.explanation")}</h2>
                  </div>
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                      <Zap className="w-3 h-3 text-warning" /> {t("ai.loading")}
                    </div>
                  )}
                </div>

                <Tabs defaultValue="deep-dive" className="w-full">
                  <TabsList className="w-full md:w-auto p-1 bg-muted/50 rounded-2xl mb-6">
                    <TabsTrigger value="deep-dive" className="rounded-xl flex-1 md:flex-none py-2">{t("ai.explanation")}</TabsTrigger>
                    <TabsTrigger value="related" className="rounded-xl flex-1 md:flex-none py-2">{t("ai.related")}</TabsTrigger>
                    <TabsTrigger value="quiz" className="rounded-xl flex-1 md:flex-none py-2">{t("quiz.title")}</TabsTrigger>
                  </TabsList>

                  <div className="transition-all duration-300">
                    <TabsContent value="deep-dive" className="space-y-6 focus-visible:outline-none">
                      {explanation ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <Card className="rounded-3xl border-primary/10 shadow-md md:col-span-2">
                            <CardContent className="p-8 space-y-6">
                              <p className="text-lg leading-relaxed text-foreground/90">
                                {explanation.explanation}
                              </p>
                              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
                                  <Lightbulb className="w-4 h-4" /> {t("ai.mnemonic")}
                                </h4>
                                <p className="text-foreground/80 italic">{explanation.tip}</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-3xl border-border/50">
                            <CardContent className="p-6 space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">{t("ai.nuances")}</h4>
                              <ul className="space-y-3">
                                {explanation.nuances.map((nuance, i) => (
                                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                    {nuance}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="rounded-3xl border-border/50">
                            <CardContent className="p-6 space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">{t("ai.examples")}</h4>
                              <ul className="space-y-3">
                                {explanation.examples.map((example, i) => (
                                  <li key={i} className="flex gap-3 text-sm italic leading-relaxed text-foreground/80">
                                    &quot;{example}&quot;
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        aiLoading ? <div className="py-20 text-center text-muted-foreground">{t("ai.loading")}</div> : null
                      )}
                    </TabsContent>

                    <TabsContent value="related" className="space-y-6 focus-visible:outline-none">
                      {related ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                          <Card className="rounded-3xl border-border/50 bg-success/5 border-success/10">
                            <CardContent className="p-6 space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-success border-b border-success/20 pb-2">{t("ai.synonyms")}</h4>
                              <div className="flex flex-wrap gap-2">
                                {related.synonyms.map((word, i) => <Badge key={i} variant="outline" className="bg-background/50">{word}</Badge>)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-3xl border-border/50 bg-destructive/5 border-destructive/10">
                            <CardContent className="p-6 space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-destructive border-b border-destructive/20 pb-2">{t("ai.antonyms")}</h4>
                              <div className="flex flex-wrap gap-2">
                                {related.antonyms.map((word, i) => <Badge key={i} variant="outline" className="bg-background/50">{word}</Badge>)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-3xl border-border/50 bg-info/5 border-info/10">
                            <CardContent className="p-6 space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-info border-b border-info/20 pb-2">{t("ai.collocations")}</h4>
                              <ul className="space-y-2">
                                {related.collocations.map((word, i) => <li key={i} className="text-xs font-medium text-info/70">• {word}</li>)}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        aiLoading ? <div className="py-20 text-center text-muted-foreground">{t("ai.loading")}</div> : null
                      )}
                    </TabsContent>

                    <TabsContent value="quiz" className="focus-visible:outline-none">
                      <AIQuizCard word={vocab.wordText} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest">{t("srs.title")}</h3>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{t("srs.nextReview")}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    new Date(vocab.nextReviewDate) <= new Date() ? "text-destructive" : "text-foreground"
                  )}>
                    {format(new Date(vocab.nextReviewDate), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{t("srs.lastReviewed")}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {vocab.lastReviewedAt ? format(new Date(vocab.lastReviewedAt), "MMM d, yyyy") : t("srs.never")}
                  </span>
                </div>

                <div className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">{t("srs.repetition")}</span>
                  </div>
                  <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded-lg">{vocab.repetitionCount}</span>
                </div>

                <div className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{t("srs.easiness")}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{vocab.easinessFactor.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t font-mono text-[10px] text-muted-foreground/60 flex flex-col gap-1">
                <div>ID: {vocab.id}</div>
                <div>CREATED: {format(new Date(vocab.createdAt), "yyyy-MM-dd HH:mm")}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-dashed bg-muted/20 hover:bg-muted/30 transition-colors">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest">{t("tag")}</h4>
                <p className="text-xs text-muted-foreground italic">Organize your thought cloud.</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl w-full" disabled={actionLoading}>
                    {currentTag ? (
                      <div className="flex items-center gap-2">
                        <span>{currentTag.icon}</span>
                        <span>{currentTag.name}</span>
                        <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        <span>{commonT("table.addTag")}</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-2xl shadow-xl border-primary/10">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                    {commonT("table.assignTag")}
                  </div>
                  <DropdownMenuSeparator className="my-1.5" />
                  {vocab.tagId && (
                    <DropdownMenuItem
                      onClick={() => handleAssignTag(null)}
                      className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl h-9"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> {commonT("table.removeTag")}
                    </DropdownMenuItem>
                  )}
                  <div className="max-h-[300px] overflow-y-auto space-y-0.5 mt-1">
                    {Object.values(tags).map(tag => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => handleAssignTag(tag.id)}
                        className="cursor-pointer rounded-xl h-10 px-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-base">{tag.icon}</span>
                          <span className={cn("text-sm", vocab.tagId === tag.id ? "font-bold" : "font-medium")}>
                            {tag.name}
                          </span>
                          {vocab.tagId === tag.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
