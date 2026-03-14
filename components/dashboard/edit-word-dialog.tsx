"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
import type { VocabularyDto } from "@/lib/api/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface EditWordDialogProps {
    item: VocabularyDto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditWordDialog({ item, open, onOpenChange, onSuccess }: EditWordDialogProps) {
    const t = useTranslations("Dashboard.vocabulary");
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [customMeaning, setCustomMeaning] = useState(item.customMeaning || "");
    const [contextSentence, setContextSentence] = useState(item.contextSentence || "");
    const [sourceUrl, setSourceUrl] = useState(item.sourceUrl || "");

    useEffect(() => {
        if (open) {
            setCustomMeaning(item.customMeaning || "");
            setContextSentence(item.contextSentence || "");
            setSourceUrl(item.sourceUrl || "");
        }
    }, [item, open]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const res = await clientApi.put(`/api/proxy/vocabularies/${item.id}`, {
                customMeaning: customMeaning.trim() || null,
                contextSentence: contextSentence.trim() || null,
                sourceUrl: sourceUrl.trim() || null,
            });

            if (res.success) {
                onOpenChange(false);
                onSuccess();
            } else {
                alert(res.error || "Failed to update word");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Edit Word</DialogTitle>
                        <DialogDescription>
                            Update the meaning, context, or source for <span className="font-semibold text-foreground">{item.wordText}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editCustomMeaning">Meaning / Translation <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                id="editCustomMeaning"
                                placeholder="Add your own definition or translation"
                                value={customMeaning}
                                onChange={(e) => setCustomMeaning(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editContextSentence">Context <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Textarea
                                id="editContextSentence"
                                placeholder="How is this word used in a sentence?"
                                value={contextSentence}
                                onChange={(e) => setContextSentence(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editSourceUrl">Source URL <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                            <Input
                                id="editSourceUrl"
                                type="url"
                                placeholder="https://..."
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
