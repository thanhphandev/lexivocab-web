import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/api-client";
import type { MasterVocabularyDto } from "@/lib/api/types";

export function useVocabulariesData(
  page: number,
  search: string,
  isApproved: boolean
) {
  const [vocabularies, setVocabularies] = useState<MasterVocabularyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadVocabularies = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getMasterVocabularies(page, 20, search, isApproved);
    if (res.success && res.data) {
      setVocabularies(res.data.items);
      setTotalPages(res.data.totalPages || 1);
    }
    setLoading(false);
  }, [page, search, isApproved]);

  useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  return { vocabularies, loading, totalPages, refetch: loadVocabularies };
}
