"use client";

import { useState, useEffect } from "react";
import { tagsApi } from "@/lib/api/api-client";
import { TagDto } from "@/lib/api/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESET_COLORS = [
    "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#0ea5e9",
    "#8b5cf6", "#d946ef", "#f97316", "#64748b", "#14b8a6",
    "#ef4444", "#3b82f6"
];

const PRESET_ICONS = [
    "📁", "📚", "🧠", "💡", "✈️", "💻", "🏥", "🍔", "🎵", "⚽", "💼", "🌟"
];

interface TagDialogProps {
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTag?: TagDto | null;
}

export function TagDialog({ 
    onSuccess, 
    open, 
    onOpenChange,
    editingTag 
}: TagDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("📁");
    const [color, setColor] = useState("#6366f1");

    useEffect(() => {
        if (open) {
            if (editingTag) {
                setName(editingTag.name);
                setIcon(editingTag.icon || "📁");
                setColor(editingTag.color || "#6366f1");
            } else {
                setName("");
                setIcon("📁");
                setColor("#6366f1");
            }
        }
    }, [open, editingTag]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            let res;
            if (editingTag) {
                res = await tagsApi.update(editingTag.id, {
                    name: name.trim(),
                    icon: icon.trim() || undefined,
                    color: color.trim() || undefined
                });
            } else {
                res = await tagsApi.create({
                    name: name.trim(),
                    icon: icon.trim() || undefined,
                    color: color.trim() || undefined
                });
            }

            if (res.success) {
                toast.success(`Successfully ${editingTag ? "updated" : "created"} tag "${name}"`);
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error(res.error || `Failed to ${editingTag ? "update" : "create"} tag`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                <form onSubmit={handleSave}>
                    <div className="p-6 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <span 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner text-xl"
                                    style={{ backgroundColor: `${color}15`, color: color }}
                                >
                                    {icon}
                                </span>
                                {editingTag ? "Edit Tag" : "Create New Tag"}
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                {editingTag 
                                    ? "Update your tag details and appearance." 
                                    : "Organize your vocabulary with a beautiful tag."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="tagName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Tag Name
                            </Label>
                            <Input
                                id="tagName"
                                placeholder="e.g. TOEFL Essential..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 rounded-xl bg-muted/30 border-muted focus:ring-primary/20 transition-all text-base font-medium"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-4">
                                Select Icon
                            </Label>
                            <div className="grid grid-cols-6 gap-2">
                                {PRESET_ICONS.map((i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setIcon(i)}
                                        className={cn(
                                            "h-11 w-11 flex items-center justify-center text-xl rounded-xl transition-all hover:scale-105 active:scale-95",
                                            icon === i 
                                                ? "bg-primary/20 ring-2 ring-primary shadow-md scale-105" 
                                                : "bg-muted/30 hover:bg-muted"
                                        )}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pb-6">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Color Theme
                            </Label>
                            <div className="grid grid-cols-6 gap-3">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "h-9 w-9 rounded-full transition-all hover:scale-110 border-2",
                                            color === c ? "ring-2 ring-offset-2 ring-primary border-white" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <div className="relative group">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <div 
                                        className="h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/10 group-hover:bg-muted/20 transition-colors"
                                        title="Pick Custom Color"
                                    >
                                        <Plus className="h-4 w-4 text-muted-foreground/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/40 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-12 px-6 hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !name.trim()}
                            className="rounded-xl h-12 px-10 font-bold shadow-lg shadow-primary/20"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTag ? "Save Changes" : "Create Tag"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
);
}
