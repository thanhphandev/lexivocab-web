import { motion } from "framer-motion";
import { Plus, Volume2, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MasterVocabularyDto } from "@/lib/api/types";

interface WordDetailCardProps {
  word: MasterVocabularyDto;
  onBack: () => void;
  onAdd: () => void;
  onPlayAudio: (url: string) => void;
  isSaving: boolean;
  isPlaying: boolean;
  t: (key: string) => string;
}

export function WordDetailCard({
  word,
  onBack,
  onAdd,
  onPlayAudio,
  isSaving,
  isPlaying,
  t,
}: WordDetailCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-accent/5 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2 text-muted-foreground"
                onClick={onBack}
              >
                ← Back to Explore
              </Button>
              <div className="flex items-center gap-3">
                <CardTitle className="text-4xl font-extrabold">{word.word}</CardTitle>
                {word.cefrLevel && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {word.cefrLevel}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                {word.phoneticUs && (
                  <button
                    onClick={() => word.audioUrl && onPlayAudio(word.audioUrl)}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                    disabled={isPlaying}
                  >
                    <span className="font-medium">US: /{word.phoneticUs}/</span>
                    {word.audioUrl &&
                      (isPlaying ? (
                        <Volume2 className="h-4 w-4 text-primary animate-pulse scale-110" />
                      ) : (
                        <Volume2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      ))}
                  </button>
                )}
                {word.phoneticUk && (
                  <span className="font-medium">UK: /{word.phoneticUk}/</span>
                )}
              </div>
            </div>
            <Button size="lg" onClick={onAdd} disabled={isSaving} className="gap-2 shadow-sm">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
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
              {word.meaning}
            </p>
          </div>

          <div className="pt-4 border-t flex flex-wrap gap-4">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`https://dictionary.cambridge.org/dictionary/english/${word.word}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Cambridge
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`https://www.oxfordlearnersdictionaries.com/definition/english/${word.word}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Oxford
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
