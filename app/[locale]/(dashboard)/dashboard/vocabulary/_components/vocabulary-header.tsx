"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, Compass } from "lucide-react";
import Link from "next/link";
import { AddWordDialog } from "@/components/dashboard/add-word-dialog";
import { BatchImportDialog } from "@/components/dashboard/batch-import-dialog";
import type { ExportFormat } from "../_types/vocabulary.schema";

interface VocabularyHeaderProps {
  t: (key: string) => string;
  locale: string;
  canExport: boolean;
  onExport: (format: ExportFormat) => void;
  onRefresh: () => void;
  onCreateTag: () => void;
}

export function VocabularyHeader({
  t,
  locale,
  canExport,
  onExport,
  onRefresh,
  onCreateTag,
}: VocabularyHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <div className="flex gap-2">
        {canExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")}>
                {t("exportCsv") || "Export CSV"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("quizlet")}>
                Export Quizlet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("json")}>
                {t("exportJson") || "Export JSON"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("txt")}>
                Export Plain Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <BatchImportDialog onSuccess={onRefresh} />
        <Button onClick={onCreateTag} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("newTag")}
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-medium"
          asChild
        >
          <Link href={`/${locale}/dashboard/explore`}>
            <Compass className="h-4 w-4" />
            {t("explore")}
          </Link>
        </Button>
        <AddWordDialog onSuccess={onRefresh} />
      </div>
    </div>
  );
}
