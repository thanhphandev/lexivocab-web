"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { TagSidebar } from "@/components/dashboard/tag-sidebar";
import { TagDialog } from "@/components/dashboard/tag-dialog";
import { VocabularyHeader } from "./_components/vocabulary-header";
import { VocabularyToolbar } from "./_components/vocabulary-toolbar";
import { VocabularyContent } from "./_components/vocabulary-content";
import { VocabularyPagination } from "./_components/vocabulary-pagination";
import { useVocabularyData } from "./_hooks/use-vocabulary-data";
import { useTagsData } from "./_hooks/use-tags-data";
import { useVocabularyExport } from "./_hooks/use-vocabulary-export";
import { useDebouncedSearch } from "./_hooks/use-debounced-search";

export default function VocabularyPage() {
  const t = useTranslations("Dashboard.vocabulary");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { canExport } = usePermissions();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "active" | "archived">("active");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  const { searchQuery, debouncedSearch, setSearchQuery } = useDebouncedSearch();
  const { tags, tagMap, refetchTags } = useTagsData();
  const { data, isLoading, refetch } = useVocabularyData({
    search: debouncedSearch,
    page,
    pageSize: 20,
    filter,
    tagFilter,
  });
  const { handleExport } = useVocabularyExport({ t, tErrors });

  const handleFilterChange = (newFilter: "all" | "active" | "archived") => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleTagFilterChange = (newTagFilter: string) => {
    setTagFilter(newTagFilter);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <VocabularyHeader
        t={t}
        locale={locale}
        canExport={canExport}
        onExport={handleExport}
        onRefresh={refetch}
        onCreateTag={() => setIsCreateTagOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="hidden lg:block sticky top-6 self-start">
          <TagSidebar
            tags={tags}
            selectedTagId={tagFilter}
            onSelectTag={handleTagFilterChange}
            onRefresh={refetchTags}
            onCreateNew={() => setIsCreateTagOpen(true)}
            isLoading={isLoading}
          />
        </aside>

        <div className="space-y-6 min-w-0">
          <VocabularyToolbar
            t={t}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={handleFilterChange}
            tagFilter={tagFilter}
            onTagFilterChange={handleTagFilterChange}
            tags={tags}
          />

          <div className="min-h-[400px]">
            <VocabularyContent
              t={t}
              isLoading={isLoading}
              data={data}
              tagMap={tagMap}
              debouncedSearch={debouncedSearch}
              tagFilter={tagFilter}
              onRefresh={refetch}
              onClearSearch={() => setSearchQuery("")}
              onClearTagFilter={() => setTagFilter("all")}
            />
          </div>

          {data && <VocabularyPagination t={t} data={data} page={page} onPageChange={setPage} />}
        </div>
      </div>

      <TagDialog
        open={isCreateTagOpen}
        onOpenChange={setIsCreateTagOpen}
        onSuccess={refetchTags}
      />
    </div>
  );
}
