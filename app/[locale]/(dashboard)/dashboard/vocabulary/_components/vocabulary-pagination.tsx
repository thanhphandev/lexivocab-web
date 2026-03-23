"use client";

import { Button } from "@/components/ui/button";
import type { PagedResult } from "@/lib/api/types";

interface VocabularyPaginationProps {
  t: (key: string, params?: Record<string, number>) => string;
  data: PagedResult<unknown>;
  page: number;
  onPageChange: (page: number) => void;
}

export function VocabularyPagination({
  t,
  data,
  page,
  onPageChange,
}: VocabularyPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 pb-10 border-t mt-4 border-muted/50">
      <div className="text-sm text-muted-foreground flex items-center gap-1.5 bg-muted/20 px-3 py-1.5 rounded-md border border-muted/40">
        <span className="font-medium">
          {t("pagination.pageOf", { page, total: Math.max(1, data.totalPages) })}
        </span>
        <span className="opacity-40 text-[10px] uppercase font-bold tracking-wider ml-1.5 pt-0.5">
          • {data.totalCount} ITEMS
        </span>
      </div>

      <div className="flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-9 px-4 rounded-lg bg-background shadow-sm hover:shadow transition-all"
        >
          {t("pagination.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= data.totalPages}
          onClick={() => onPageChange(Math.min(data.totalPages, page + 1))}
          className="h-9 px-4 rounded-lg bg-background shadow-sm hover:shadow transition-all"
        >
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  );
}
