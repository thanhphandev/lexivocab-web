import { useState } from "react";
import { useTranslations } from "next-intl";
import { TagDto } from "@/lib/api/types";
import {
    MoreVertical,
    Plus,
    Hash,
    Trash2,
    Pencil,
    Loader2,
    ChevronRight,
    Folder,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TagDialog } from "./tag-dialog";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-handler";
import { ConfirmDialog } from "./confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { tagsApi } from "@/lib/api/api-client";

interface TagSidebarProps {
    tags: TagDto[];
    selectedTagId: string;
    onSelectTag: (id: string) => void;
    onRefresh: () => void;
    onCreateNew: () => void;
    isLoading?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function TagSidebar({
    tags,
    selectedTagId,
    onSelectTag,
    onRefresh,
    onCreateNew,
    isLoading = false,
    isCollapsed = false,
    onToggleCollapse
}: TagSidebarProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [tagToDelete, setTagToDelete] = useState<TagDto | null>(null);
    const [editingTag, setEditingTag] = useState<TagDto | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const t = useTranslations("Dashboard.vocabulary.tagSidebar");

    const handleDelete = async () => {
        if (!tagToDelete) return;

        const id = tagToDelete.id;
        setIsDeleting(id);
        try {
            const res = await tagsApi.delete(id);
            if (res.success) {
                toast.success(t("deleteSuccess", { name: tagToDelete.name }));
                if (selectedTagId === id) onSelectTag("all");
                onRefresh();
            } else {
                showErrorToast(res, t("deleteFailed"), t);
            }
        } finally {
            setIsDeleting(null);
            setTagToDelete(null);
        }
    };

    const handleEditClick = (e: React.MouseEvent, tag: TagDto) => {
        e.stopPropagation();
        setEditingTag(tag);
        setIsEditDialogOpen(true);
    };

    return (
        <div className={cn(
            "h-full flex flex-col gap-6 transition-all duration-300",
            isCollapsed ? "w-16 pr-0" : "w-full pr-4"
        )}>
            <ConfirmDialog
                open={!!tagToDelete}
                onOpenChange={(open) => !open && setTagToDelete(null)}
                title={t("deleteTitle")}
                description={t("deleteDesc", { name: tagToDelete?.name ?? "" })}
                confirmText={t("deleteConfirm")}
                variant="destructive"
                onConfirm={handleDelete}
            />
            <div className={cn(
                "flex items-center",
                isCollapsed ? "flex-col gap-4" : "justify-between"
            )}>
                {!isCollapsed && (
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-2">
                        {t("title")}
                    </h3>
                )}
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                        onClick={onCreateNew}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-accent rounded-full hidden lg:flex"
                        onClick={onToggleCollapse}
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Tag Dialog for Editing */}
            <TagDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={() => {
                    onRefresh();
                    setEditingTag(null);
                }}
                editingTag={editingTag}
            />

            <div className="space-y-1">
                <Button
                    variant="ghost"
                    onClick={() => onSelectTag("all")}
                    className={cn(
                        "w-full justify-start h-10 px-3 rounded-lg transition-all border border-transparent",
                        isCollapsed ? "justify-center px-0" : "gap-3",
                        selectedTagId === "all"
                            ? "bg-primary/10 text-primary font-semibold border-primary/20 shadow-sm"
                            : "text-muted-foreground hover:bg-accent/50"
                    )}
                >
                    <Hash className={cn("h-4 w-4 shrink-0", isCollapsed && "mx-auto")} />
                    {!isCollapsed && <span className="flex-1 text-left">{t("allWords")}</span>}
                    {!isCollapsed && selectedTagId === "all" && <ChevronRight className="h-3 w-3" />}
                </Button>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[60vh] scrollbar-thin">
                {tags.length === 0 ? (
                    isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-11 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center border-2 border-dashed rounded-xl opacity-40">
                            <Folder className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">{t("noTags")}</p>
                        </div>
                    )
                ) : (
                    tags.map((tag) => (
                        <motion.div
                            key={tag.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            layout
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectTag(tag.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        onSelectTag(tag.id);
                                    }
                                }}
                                className={cn(
                                    "flex items-center w-full justify-start h-11 px-3 rounded-xl transition-all border group relative overflow-hidden cursor-pointer",
                                    isCollapsed ? "justify-center px-0" : "gap-3",
                                    selectedTagId === tag.id
                                        ? "bg-card border-border/50 shadow-md ring-1 ring-primary/20"
                                        : "hover:bg-accent/50 border-transparent"
                                )}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm shrink-0"
                                    style={{
                                        backgroundColor: `${tag.color || '#6366f1'}15`,
                                        color: tag.color || '#6366f1'
                                    }}
                                >
                                    {tag.icon || "📁"}
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 text-left truncate">
                                            <div className={cn(
                                                "text-sm font-medium leading-none mb-1",
                                                selectedTagId === tag.id ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {tag.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground opacity-60">
                                                {t("wordCount", { count: tag.wordCount })}
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 focus:opacity-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                <DropdownMenuItem
                                                    className="text-xs cursor-pointer"
                                                    onClick={(e) => handleEditClick(e, tag)}
                                                >
                                                    <Pencil className="mr-2 h-3 w-3" /> {t("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs text-destructive cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); setTagToDelete(tag); }}
                                                    disabled={isDeleting === tag.id}
                                                >
                                                    {isDeleting === tag.id ? (
                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="mr-2 h-3 w-3" />
                                                    )}
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}

                                {selectedTagId === tag.id && (
                                    <motion.div
                                        layoutId="activeTag"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-full ml-1"
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {!isCollapsed && (
                <div className="mt-auto p-4 rounded-2xl bg-primary/5 border border-primary/10 hidden lg:block">
                    <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">{t("tipLabel")}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {t("tipDesc")}
                    </p>
                </div>
            )}
        </div>
    );
}
