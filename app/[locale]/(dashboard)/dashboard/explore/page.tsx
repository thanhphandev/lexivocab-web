"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useOnClickOutside } from "@/lib/hooks/use-click-outside";
import type { MasterVocabularyDto } from "@/lib/api/types";
import { SearchBar } from "./_components/search-bar";
import { SearchDropdown } from "./_components/search-dropdown";
import { WordDetailCard } from "./_components/word-detail-card";
import { WordGrid } from "./_components/word-grid";
import { Pagination } from "./_components/pagination";
import { useExploreData } from "./_hooks/use-explore-data";
import { useDebouncedSearch } from "./_hooks/use-debounced-search";
import { useWordActions } from "./_hooks/use-word-actions";

export default function ExplorePage() {
  const t = useTranslations("Dashboard.explore");
  const tErrors = useTranslations("errors");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<MasterVocabularyDto | null>(null);
  const [page, setPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedSearch(searchQuery);
  const { words, isLoading, totalPages } = useExploreData(page, debouncedSearch);
  const { isSaving, playingAudioUrl, handleAddToVocab, playAudio } =
    useWordActions(tErrors);

  useOnClickOutside(searchRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    if (searchQuery.trim()) {
      setPage(1);
      setIsDropdownOpen(true);
    }
  }, [debouncedSearch]);

  const handleSelect = (word: MasterVocabularyDto) => {
    setSelectedWord(word);
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative" ref={searchRef}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={t("searchPlaceholder")}
        />
        <SearchDropdown
          isOpen={
            searchQuery.trim() !== "" && isDropdownOpen && words.length > 0 && !selectedWord
          }
          words={words}
          onSelect={handleSelect}
        />
      </div>

      <main className="min-h-[400px]">
        {selectedWord ? (
          <WordDetailCard
            word={selectedWord}
            onBack={() => setSelectedWord(null)}
            onAdd={() => handleAddToVocab(selectedWord, t("addToVocab"))}
            onPlayAudio={playAudio}
            isSaving={isSaving}
            isPlaying={playingAudioUrl === selectedWord.audioUrl}
            t={t}
          />
        ) : (
          <WordGrid
            words={words}
            isLoading={isLoading && !selectedWord}
            isSaving={isSaving}
            onSelect={handleSelect}
            onAdd={(word) => handleAddToVocab(word, t("addToVocab"))}
          />
        )}
      </main>

      {!selectedWord && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
