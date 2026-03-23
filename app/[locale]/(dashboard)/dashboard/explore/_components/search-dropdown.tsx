import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { MasterVocabularyDto } from "@/lib/api/types";

interface SearchDropdownProps {
  isOpen: boolean;
  words: MasterVocabularyDto[];
  onSelect: (word: MasterVocabularyDto) => void;
}

export function SearchDropdown({ isOpen, words, onSelect }: SearchDropdownProps) {
  if (!isOpen || words.length === 0) return null;

  return (
    <AnimatePresence>
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
            onClick={() => onSelect(item)}
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
    </AnimatePresence>
  );
}
