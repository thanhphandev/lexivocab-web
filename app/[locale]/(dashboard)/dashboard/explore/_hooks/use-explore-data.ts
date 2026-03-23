import { useState, useEffect } from "react";
import { vocabularyApi } from "@/lib/api/api-client";
import type { MasterVocabularyDto } from "@/lib/api/types";

export function useExploreData(page: number, debouncedSearch: string) {
  const [words, setWords] = useState<MasterVocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

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

  return { words, isLoading, totalPages };
}
