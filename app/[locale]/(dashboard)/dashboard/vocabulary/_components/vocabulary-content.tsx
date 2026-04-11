"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { VocabularyTable } from "@/components/dashboard/vocabulary-table";
import { SearchX, FilterX, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import type { VocabularyDto, PagedResult, TagDto } from "@/lib/api/types";

interface VocabularyContentProps {
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
  data: PagedResult<VocabularyDto> | null;
  tagMap: Record<string, TagDto>;
  debouncedSearch: string;
  tagFilter: string;
  onRefresh: () => void;
  onClearSearch: () => void;
  onClearTagFilter: () => void;
}

export function VocabularyContent({
  t,
  isLoading,
  data,
  tagMap,
  debouncedSearch,
  tagFilter,
  onRefresh,
  onClearSearch,
  onClearTagFilter,
}: VocabularyContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-card rounded-xl border shadow-sm">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data?.items.length === 0) {
    return (
      <EmptyState
        icon={debouncedSearch ? SearchX : tagFilter !== "all" ? FilterX : Inbox}
        illustration={
          debouncedSearch
            ? "/illustrations/search-empty.png"
            : !tagFilter || tagFilter === "all"
              ? "/illustrations/empty-vocab.png"
              : undefined
        }
        title={
          debouncedSearch
            ? t("empty.noMatchTitle")
            : tagFilter !== "all"
              ? t("empty.emptyTagTitle")
              : t("empty.noWordsTitle")
        }
        description={
          debouncedSearch
            ? t("empty.noMatchDesc", { query: debouncedSearch })
            : tagFilter !== "all"
              ? t("empty.emptyTagDesc")
              : t("empty.noWordsDesc")
        }
        action={
          debouncedSearch
            ? {
                label: t("empty.clearSearch"),
                onClick: onClearSearch,
              }
            : tagFilter !== "all"
              ? {
                  label: t("empty.viewAllWords"),
                  onClick: onClearTagFilter,
                }
              : {
                  label: t("empty.addFirstWord"),
                  onClick: () => document.getElementById("add-word-trigger")?.click(),
                }
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <VocabularyTable
        data={data}
        tags={tagMap}
        isLoading={false}
        onRefresh={onRefresh}
      />
    </motion.div>
  );
}
