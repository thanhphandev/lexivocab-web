import { useState, useCallback, useEffect } from "react";
import { clientApi } from "@/lib/api/api-client";
import type { VocabularyDto, PagedResult } from "@/lib/api/types";
import type { VocabularyFilter } from "../_types/vocabulary.schema";

export function useVocabularyData(filters: VocabularyFilter) {
  const [data, setData] = useState<PagedResult<VocabularyDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { search, page, pageSize, filter, tagFilter } = filters;

  const fetchVocabulary = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) params.append("search", search);
      if (filter !== "all") {
        params.append("isArchived", filter === "archived" ? "true" : "false");
      }
      if (tagFilter !== "all" && tagFilter !== "none") {
        params.append("tagId", tagFilter);
      }

      const res = await clientApi.get<PagedResult<VocabularyDto>>(
        `/api/proxy/vocabularies?${params.toString()}`
      );
      if (res.success) setData(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [search, page, pageSize, filter, tagFilter]);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  return { data, isLoading, refetch: fetchVocabulary };
}
