"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import type { TagDto } from "@/lib/api/types";

interface VocabularyToolbarProps {
  t: (key: string) => string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: "all" | "active" | "archived";
  onFilterChange: (value: "all" | "active" | "archived") => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  tags: TagDto[];
}

export function VocabularyToolbar({
  t,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  tagFilter,
  onTagFilterChange,
  tags,
}: VocabularyToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm"
    >
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          className="pl-9 w-full bg-background border-muted"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 items-center justify-end">
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border">
          <Button
            variant={filter === "active" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("active")}
            className="rounded-full h-8 px-4 text-xs font-semibold"
          >
            {t("statusFilter.active")}
          </Button>
          <Button
            variant={filter === "archived" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("archived")}
            className="rounded-full h-8 px-4 text-xs font-semibold"
          >
            {t("statusFilter.archived")}
          </Button>
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange("all")}
            className="rounded-full h-8 px-4 text-xs font-semibold"
          >
            {t("statusFilter.all")}
          </Button>
        </div>
        <Select value={tagFilter} onValueChange={onTagFilterChange}>
          <SelectTrigger className="w-[140px] h-9 lg:hidden">
            <SelectValue placeholder={t("allTags")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTags")}</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <span className="flex items-center gap-2">
                  <span>{tag.icon}</span> {tag.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}
