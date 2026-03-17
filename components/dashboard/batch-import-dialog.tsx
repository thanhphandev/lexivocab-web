"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";

export function BatchImportDialog({ onSuccess }: { onSuccess: () => void }) {
    const t = useTranslations("Dashboard.vocabulary");
    const tImport = useTranslations("Dashboard.vocabulary.batchImport");
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [importText, setImportText] = useState("");

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importText.trim()) return;

        setIsLoading(true);
        try {
            const wordsStr = importText.split("\n").filter(l => l.trim());
            const wordsList = wordsStr.map(line => {
                const parts = line.split(",").map(p => p.trim());
                return {
                    wordText: parts[0],
                    customMeaning: parts[1] || undefined,
                    contextSentence: parts[2] || undefined,
                };
            }).filter(w => w.wordText);

            if (wordsList.length === 0) {
                alert(tImport("noWords"));
                setIsLoading(false);
                return;
            }

            const res = await clientApi.post("/api/proxy/vocabularies/batch", { words: wordsList });
            if (res.success) {
                setOpen(false);
                setImportText("");
                alert(tImport("success", { count: (res.data as number) || wordsList.length }));
                onSuccess();
            } else {
                alert(tImport("failed", { error: res.error }));
            }
        } catch (e) {
            console.error("Batch import error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hidden sm:flex">
                    <Upload className="mr-2 h-4 w-4" />
                    {t("batchImportText")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleImport}>
                    <DialogHeader>
                        <DialogTitle>{t("batchImportText")}</DialogTitle>
                        <DialogDescription>{tImport("desc")}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="importData">{tImport("listLabel")}</Label>
                            <Textarea
                                id="importData"
                                placeholder={tImport("listPlaceholder")}
                                className="min-h-[200px]"
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {tImport("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading || !importText.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {tImport("import")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
