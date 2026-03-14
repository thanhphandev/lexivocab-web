"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import type { VocabularyDto, PagedResult } from "@/lib/api/types";
import { clientApi, vocabularyApi } from "@/lib/api/api-client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Pencil,
    Archive,
    ArchiveRestore,
    Trash2,
    ExternalLink,
    AlertCircle,
    Loader2,
    Volume2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditWordDialog } from "./edit-word-dialog";

interface VocabularyTableProps {
    data: PagedResult<VocabularyDto> | null;
    tags: Record<string, import("@/lib/api/types").TagDto>;
    isLoading: boolean;
    onRefresh: () => void;
}

export function VocabularyTable({ data, tags, isLoading, onRefresh }: VocabularyTableProps) {
    const t = useTranslations("Dashboard.vocabulary");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<VocabularyDto | null>(null);

    const getLevelBadge = (level: number) => {
        if (level === 0) return { label: t("badges.new"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
        if (level < 5) return { label: t("badges.learning"), className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
        return { label: t("badges.mastered"), className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
    };

    const handleArchiveToggle = async (id: string, currentlyArchived: boolean) => {
        if (actionLoading) return;
        setActionLoading(id);

        try {
            // PATCH /api/proxy/vocabularies/{id}/archive — toggles archive status
            await clientApi.patch(`/api/proxy/vocabularies/${id}/archive`);
            onRefresh();
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssignTag = async (id: string, tagId: string | null) => {
        if (actionLoading) return;
        setActionLoading(id);

        try {
            await vocabularyApi.updateTag(id, tagId);
            onRefresh();
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this word?")) return;
        if (actionLoading) return;

        setActionLoading(id);
        try {
            await clientApi.delete(`/api/proxy/vocabularies/${id}`);
            onRefresh();
        } finally {
            setActionLoading(null);
        }
    };

    const playAudio = (url: string | null) => {
        if (!url) return;
        const audio = new Audio(url);
        audio.play().catch(console.error);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 border rounded-xl bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data || data.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-card text-center px-4">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">{t("empty")}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {t("subtitle")}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">{t("table.word")}</TableHead>
                            <TableHead className="min-w-[200px]">{t("table.meaning")}</TableHead>
                            <TableHead className="w-[120px]">{t("table.level")}</TableHead>
                            <TableHead className="w-[120px]">Folder</TableHead>
                            <TableHead className="w-[150px]">{t("table.nextReview")}</TableHead>
                            <TableHead className="w-[100px]">{t("table.status")}</TableHead>
                            <TableHead className="w-[80px] text-right">{t("table.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((item) => {
                            const badge = getLevelBadge(item.repetitionCount);
                            const isArchived = item.isArchived;

                            return (
                                <TableRow key={item.id} className={isArchived ? "opacity-60" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{item.wordText}</span>
                                            {item.audioUrl && (
                                                <button
                                                    onClick={() => playAudio(item.audioUrl)}
                                                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                                    title="Play audio"
                                                >
                                                    <Volume2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        {(item.phoneticUs || item.phoneticUk) && (
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                {item.phoneticUs || item.phoneticUk}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="line-clamp-2" title={item.customMeaning || ""}>
                                            {item.customMeaning || <span className="text-muted-foreground italic">No meaning provided</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", badge.className)}>
                                            {badge.label}
                                        </span>
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                            Lvl {item.repetitionCount} • EF {(item.easinessFactor || 2.5).toFixed(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        disabled={actionLoading === item.id}
                                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium hover:ring-1 hover:ring-ring transition-all focus:outline-none disabled:opacity-50"
                                                        style={{
                                                            backgroundColor: item.tagId && tags[item.tagId] ? `${tags[item.tagId].color || '#6366f1'}15` : 'transparent',
                                                            color: item.tagId && tags[item.tagId] ? (tags[item.tagId].color || undefined) : undefined,
                                                            border: item.tagId && tags[item.tagId] ? `1px solid ${tags[item.tagId].color || '#6366f1'}30` : '1px dashed hsl(var(--muted-foreground) / 0.5)',
                                                        }}
                                                    >
                                                        {item.tagId && tags[item.tagId] ? (
                                                            <span className="truncate max-w-[120px] flex items-center gap-1">
                                                                <span>{tags[item.tagId].icon}</span>
                                                                {tags[item.tagId].name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground opacity-70">+ Tag</span>
                                                        )}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-[180px]">
                                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Select Folder</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {item.tagId && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleAssignTag(item.id, null)} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                                                                <Trash2 className="mr-2 h-3 w-3" /> Remove Tag
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    <div className="max-h-[250px] overflow-y-auto">
                                                        {Object.values(tags).map(tag => (
                                                            <DropdownMenuItem
                                                                key={tag.id}
                                                                onClick={() => handleAssignTag(item.id, tag.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2 " style={{ color: item.tagId === tag.id ? (tag.color || undefined) : undefined }}>
                                                                    <span>{tag.icon}</span>
                                                                    <span className={item.tagId === tag.id ? "font-semibold" : ""}>{tag.name}</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {format(new Date(item.nextReviewDate), "MMM d, yyyy")}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {isArchived ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                {t("badges.archived")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                                {t("badges.active")}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={actionLoading === item.id}>
                                                    {actionLoading === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                {item.sourceUrl && (
                                                    <DropdownMenuItem onClick={() => window.open(item.sourceUrl!, '_blank')}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        {t("actions.source")}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    {t("actions.edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleArchiveToggle(item.id, isArchived)}
                                                >
                                                    {isArchived ? (
                                                        <><ArchiveRestore className="mr-2 h-4 w-4" /> {t("actions.unarchive")}</>
                                                    ) : (
                                                        <><Archive className="mr-2 h-4 w-4" /> {t("actions.archive")}</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t("actions.delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {editingItem && (
                <EditWordDialog
                    item={editingItem}
                    open={!!editingItem}
                    onOpenChange={(v) => !v && setEditingItem(null)}
                    onSuccess={() => {
                        setEditingItem(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}
