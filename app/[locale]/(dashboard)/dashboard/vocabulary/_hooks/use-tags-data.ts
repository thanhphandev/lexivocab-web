import { useState, useCallback, useEffect } from "react";
import { tagsApi } from "@/lib/api/api-client";
import type { TagDto } from "@/lib/api/types";

export function useTagsData() {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [tagMap, setTagMap] = useState<Record<string, TagDto>>({});

  const fetchTags = useCallback(async () => {
    try {
      const res = await tagsApi.getList();
      if (res.success && res.data) {
        setTags(res.data);
        const map: Record<string, TagDto> = {};
        res.data.forEach((tag) => (map[tag.id] = tag));
        setTagMap(map);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, tagMap, refetchTags: fetchTags };
}
