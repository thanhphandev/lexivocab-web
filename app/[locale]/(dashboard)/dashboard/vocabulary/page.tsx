"use client";

import { useState, useCallback, useEffect } from "react";
import { clientApi, tagsApi } from "@/lib/api/api-client";
import type { VocabularyDto, PagedResult, TagDto } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useAuth } from "@/lib/auth/auth-context";
import { VocabularyTable } from "@/components/dashboard/vocabulary-table";
import { AddWordDialog } from "@/components/dashboard/add-word-dialog";
import { BatchImportDialog } from "@/components/dashboard/batch-import-dialog";
import { TagDialog } from "@/components/dashboard/tag-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { TagSidebar } from "@/components/dashboard/tag-sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Download, Plus, SearchX, Inbox, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VocabularyPage() {
    const t = useTranslations("Dashboard.vocabulary");
    const { permissions } = useAuth();
    const { canExport, quotaMax } = usePermissions();
    
    const [data, setData] = useState<PagedResult<VocabularyDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<"all" | "active" | "archived">("active");
    const [tagFilter, setTagFilter] = useState<string>("all");
    const [tags, setTags] = useState<TagDto[]>([]);
    const [tagMap, setTagMap] = useState<Record<string, TagDto>>({});
    const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

    // Fetch tags
    const fetchTags = useCallback(async () => {
        try {
            const res = await tagsApi.getList();
            if (res.success && res.data) {
                setTags(res.data);
                const map: Record<string, TagDto> = {};
                res.data.forEach(t => map[t.id] = t);
                setTagMap(map);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchVocabulary = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: "20"
            });

            if (debouncedSearch) {
                params.append("search", debouncedSearch);
            }

            if (filter !== "all") {
                params.append("isArchived", filter === "archived" ? "true" : "false");
            }

            if (tagFilter !== "all" && tagFilter !== "none") {
                params.append("tagId", tagFilter);
            }

            const res = await clientApi.get<PagedResult<VocabularyDto>>(`/api/proxy/vocabularies?${params.toString()}`);
            if (res.success) {
                setData(res.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, filter, tagFilter]);

    useEffect(() => {
        fetchVocabulary();
    }, [fetchVocabulary]);

    const handleExport = async (format: "csv" | "json") => {
        try {
            const res = await fetch(`/api/proxy/vocabularies/export?format=${format}`);
            if (!res.ok) {
                toast.error("Failed to export data. Please try again later.");
                return;
            }
            toast.success(`Successfully exported as ${format.toUpperCase()}`);
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `lexivocab-export-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error("Export failed", e);
        }
    };

    const totalItems = data?.totalCount ?? permissions?.currentCount ?? 0;
    const maxItems = quotaMax;
    const isNearLimit = maxItems !== 2147483647 && totalItems >= maxItems * 0.8;
    const isOverLimit = maxItems !== 2147483647 && totalItems >= maxItems;

    return (
        <div className="space-y-6 pb-10">
            <AnimatePresence>
                {isNearLimit && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Alert variant={isOverLimit ? "destructive" : "default"} className="mb-4 bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">
                                {isOverLimit ? "Quota Exceeded" : "Approaching Quota Limit"}
                            </AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>
                                    {isOverLimit 
                                        ? "You have reached your vocabulary limit. Please upgrade to add more words." 
                                        : `You have used ${totalItems} out of ${maxItems} words. Consider upgrading soon.`}
                                </span>
                                {permissions?.plan === "Free" && (
                                    <Link href={`/${useAuth().user?.id}/pricing`} className="font-bold underline ml-4 whitespace-nowrap">
                                        Upgrade Now →
                                    </Link>
                                )}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex gap-2">
                    {canExport && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport("csv")}>
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport("json")}>
                                    Export as JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <BatchImportDialog onSuccess={fetchVocabulary} />
                    <Button 
                        onClick={() => setIsCreateTagOpen(true)}
                        variant="outline"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Tag
                    </Button>
                    <AddWordDialog onSuccess={fetchVocabulary} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                {/* Sidebar */}
                <aside className="hidden lg:block sticky top-6 self-start">
                    <TagSidebar 
                        tags={tags}
                        selectedTagId={tagFilter}
                        onSelectTag={(id) => { setTagFilter(id); setPage(1); }}
                        onRefresh={fetchTags}
                        onCreateNew={() => setIsCreateTagOpen(true)}
                        isLoading={isLoading}
                    />
                </aside>

                <div className="space-y-6">
                    {/* Toolbar */}
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 items-center justify-end">
                            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border">
                                <Button
                                    variant={filter === "active" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => { setFilter("active"); setPage(1); }}
                                    className="rounded-full h-8 px-4 text-xs font-semibold"
                                >
                                    {t("statusFilter.active")}
                                </Button>
                                <Button
                                    variant={filter === "archived" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => { setFilter("archived"); setPage(1); }}
                                    className="rounded-full h-8 px-4 text-xs font-semibold"
                                >
                                    {t("statusFilter.archived")}
                                </Button>
                                <Button
                                    variant={filter === "all" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => { setFilter("all"); setPage(1); }}
                                    className="rounded-full h-8 px-4 text-xs font-semibold"
                                >
                                    {t("statusFilter.all")}
                                </Button>
                            </div>
                            
                            <Select value={tagFilter} onValueChange={(val) => { setTagFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[140px] h-9 lg:hidden">
                                    <SelectValue placeholder="All Tags" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tags</SelectItem>
                                    {tags.map(tag => (
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

                    {/* Table or Empty States */}
                    <div className="min-h-[400px]">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-card rounded-xl border shadow-sm">
                                    <div className="space-y-3">
                                        {[...Array(6)].map((_, i) => (
                                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : data?.items.length === 0 ? (
                            <EmptyState
                                icon={debouncedSearch ? SearchX : tagFilter !== "all" ? FilterX : Inbox}
                                title={
                                    debouncedSearch 
                                        ? "No matches found" 
                                        : tagFilter !== "all" 
                                            ? "Empty Tag" 
                                            : "No words yet"
                                }
                                description={
                                    debouncedSearch 
                                        ? `We couldn't find anything matching "${debouncedSearch}". Try a different keyword.` 
                                        : tagFilter !== "all"
                                            ? "This tag doesn't contain any words yet. Start by adding some vocabulary!"
                                            : "Your vocabulary library is empty. Start adding words to begin your learning journey!"
                                }
                                action={debouncedSearch ? {
                                    label: "Clear Search",
                                    onClick: () => setSearchQuery("")
                                } : tagFilter !== "all" ? {
                                    label: "View All Words",
                                    onClick: () => setTagFilter("all")
                                } : {
                                    label: "Add Your First Word",
                                    onClick: () => document.getElementById('add-word-trigger')?.click()
                                }}
                            />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <VocabularyTable
                                    data={data}
                                    tags={tagMap}
                                    isLoading={false}
                                    onRefresh={fetchVocabulary}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {data && data.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-4 pb-10">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="h-9 px-4"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border">
                                Page <span className="text-foreground">{page}</span> of {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= data.totalPages}
                                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                className="h-9 px-4"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tag Creation Dialog */}
            <TagDialog 
                open={isCreateTagOpen} 
                onOpenChange={setIsCreateTagOpen} 
                onSuccess={fetchTags} 
            />
        </div>
    );
}
