import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MasterVocabularyDto } from "@/lib/api/types";

interface WordGridProps {
  words: MasterVocabularyDto[];
  isLoading: boolean;
  isSaving: boolean;
  onSelect: (word: MasterVocabularyDto) => void;
  onAdd: (word: MasterVocabularyDto) => void;
}

export function WordGrid({ words, isLoading, isSaving, onSelect, onAdd }: WordGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map((word) => (
        <Card
          key={word.id}
          className="hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/50"
          onClick={() => onSelect(word)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-bold text-primary">{word.word}</CardTitle>
              {word.cefrLevel && (
                <Badge variant="outline" className="text-[10px]">
                  {word.cefrLevel}
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-sm italic">
              {word.meaning}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground tracking-wider font-mono">
                {word.phoneticUs ? `/${word.phoneticUs}/` : ""}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(word);
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 mr-1" />
                )}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
