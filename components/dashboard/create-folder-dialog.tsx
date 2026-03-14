"use client";

import { useState } from "react";
import { tagsApi } from "@/lib/api/api-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FolderPlus } from "lucide-react";

export function CreateFolderDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("📁");
    const [color, setColor] = useState("#6366f1");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await tagsApi.create({
                name: name.trim(),
                icon: icon.trim() || undefined,
                color: color.trim() || undefined
            });

            if (res.success) {
                setOpen(false);
                setName("");
                setIcon("📁");
                setColor("#6366f1");
                onSuccess();
            } else {
                alert(res.error || "Failed to create folder");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FolderPlus className="h-4 w-4" />
                    New Folder
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Create Folder</DialogTitle>
                        <DialogDescription>
                            Organize your vocabulary into folders.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="folderName">Folder Name</Label>
                            <Input
                                id="folderName"
                                placeholder="e.g. IELTS, Medical, IT..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="space-y-2 flex-[1]">
                                <Label htmlFor="folderIcon">Icon (Emoji)</Label>
                                <Input
                                    id="folderIcon"
                                    placeholder="📁"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    maxLength={3}
                                />
                            </div>
                            <div className="space-y-2 flex-[2]">
                                <Label htmlFor="folderColor">Theme Color</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        id="folderColor"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="h-10 w-14 p-1 cursor-pointer rounded-md border bg-background"
                                    />
                                    <Input
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#6366f1"
                                        className="uppercase font-mono text-sm"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => { setOpen(false); setName(""); setIcon("📁"); setColor("#6366f1") }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
