"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ReviewCardDto } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";

interface FlashcardProps {
    card: ReviewCardDto;
    onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export function Flashcard({ card, onRate }: FlashcardProps) {
    const t = useTranslations("Dashboard.review");
    const tCard = useTranslations("Dashboard.flashcard");
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => setIsFlipped((prev) => !prev);

    const handleRate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
        setIsFlipped(false);
        onRate(quality);
    };

    const playAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (card.audioUrl) {
            new Audio(card.audioUrl).play().catch(console.error);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8">
            <div
                className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer"
                onClick={handleFlip}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {/* Front */}
                    <div
                        className="absolute w-full h-full flex flex-col items-center justify-center p-8 bg-card border rounded-3xl shadow-lg"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                        {card.audioUrl && (
                            <button
                                onClick={playAudio}
                                className="absolute top-6 right-6 p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            >
                                <Volume2 className="h-6 w-6" />
                            </button>
                        )}
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground text-center mb-4">
                            {card.wordText}
                        </h2>
                        {card.phoneticUs && (
                            <p className="text-xl text-muted-foreground font-mono">{card.phoneticUs}</p>
                        )}
                        <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-muted-foreground animate-pulse">
                            {t("cardFront")}
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute w-full h-full flex flex-col p-8 bg-card border border-primary/20 rounded-3xl shadow-xl overflow-y-auto"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                        <div className="flex flex-col h-full">
                            <h2 className="text-3xl font-bold text-foreground mb-6 border-b pb-4">
                                {card.wordText}
                            </h2>
                            <div className="space-y-6 flex-grow">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                        {tCard("meaningLabel")}
                                    </h3>
                                    <p className="text-lg text-foreground">
                                        {card.customMeaning || <span className="italic opacity-50">{tCard("noMeaning")}</span>}
                                    </p>
                                </div>
                                {card.contextSentence && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                            {tCard("contextLabel")}
                                        </h3>
                                        <p className="text-lg text-foreground italic border-l-4 border-primary/30 pl-4 py-1">
                                            "{card.contextSentence}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Rating Buttons */}
            <div className="h-20 w-full flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="grid grid-cols-4 gap-2 md:gap-4 w-full"
                        >
                            {([
                                { score: 0,  cls: "border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-950/50" },
                                { score: 1,  cls: "border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-900/50 dark:hover:bg-orange-950/50" },
                                { score: 3,  cls: "border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-900/50 dark:hover:bg-emerald-950/50" },
                                { score: 5,  cls: "border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-900/50 dark:hover:bg-blue-950/50" },
                            ] as const).map(({ score, cls }) => (
                                <Button key={score} size="lg" variant="outline"
                                    className={`h-16 flex flex-col gap-1 ${cls}`}
                                    onClick={(e) => { e.stopPropagation(); handleRate(score); }}
                                >
                                    <span className="font-bold">{t(`quality.score_${score}`)}</span>
                                    <span className="text-[10px] opacity-70">{t(`quality.score_${score}_hint`)}</span>
                                </Button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
