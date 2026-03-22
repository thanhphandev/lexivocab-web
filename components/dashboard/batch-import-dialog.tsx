"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/api/api-client";
import Papa from "papaparse";
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
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-handler";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Loader2, Upload, FileUp, FileText, Check, AlertCircle, Lock } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

export function BatchImportDialog({ onSuccess }: { onSuccess: () => void }) {
    const t = useTranslations("Dashboard.vocabulary");
    const tImport = useTranslations("Dashboard.vocabulary.batchImport");
    const tErrors = useTranslations("errors");
    const locale = useLocale();
    const { canBatchImport } = usePermissions();

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [importText, setImportText] = useState("");
    const [activeTab, setActiveTab] = useState<"file" | "text">("file");
    const [parsedPreview, setParsedPreview] = useState<any[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseTextToPreview = (text: string) => {
        const res = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });

        let rows = res.data;
        if (rows.length > 0 && rows[0][0]?.toLowerCase() === "word" && rows[0][1]?.toLowerCase() === "meaning") {
            rows = rows.slice(1);
        }

        const wordsList = rows.map(parts => {
            return {
                wordText: parts[0]?.trim() || "",
                customMeaning: parts[1]?.trim() || undefined,
                contextSentence: parts[2]?.trim() || undefined,
            };
        }).filter(w => w.wordText);
        setParsedPreview(wordsList);
    };

    const handleTextChange = (val: string) => {
        setImportText(val);
        parseTextToPreview(val);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            // Remove BOM if present
            const cleanResult = result.replace(/^\uFEFF/, '');
            setImportText(cleanResult);
            parseTextToPreview(cleanResult);
        };
        reader.readAsText(file, "UTF-8");
        // Reset input so the same file can be uploaded again if needed
        e.target.value = '';
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parsedPreview.length === 0) return;

        setIsLoading(true);
        const loadingId = toast.loading(tImport("importing") || "Importing words...");

        try {
            const res = await clientApi.post("/api/proxy/vocabularies/batch", { words: parsedPreview });
            if (res.success) {
                setOpen(false);
                setImportText("");
                setParsedPreview([]);
                toast.success(tImport("success", { count: (res.data as number) || parsedPreview.length }));
                onSuccess();
            } else {
                showErrorToast(
                    res,
                    res.errorCode ? tErrors(res.errorCode as any) : (tImport("failed", { error: res.error }) || res.error || "Failed to import vocabulary."),
                    tErrors
                );
            }
        } catch (e) {
            console.error("Batch import error:", e);
            showErrorToast(e, tImport("unexpectedError") || "An unexpected error occurred during import.", tErrors);
        } finally {
            setIsLoading(false);
            toast.dismiss(loadingId);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) { setTimeout(() => { setImportText(""); setParsedPreview([]); setActiveTab("file"); }, 300); }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hidden sm:flex gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-medium">
                    <FileUp className="h-4 w-4" />
                    {t("batchImportText") || "Import CSV"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-hidden">
                <form onSubmit={handleImport} className="flex flex-col h-full max-h-[85vh]">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileUp className="h-5 w-5 text-primary" />
                            {t("batchImportText") || "Import Vocabulary"}
                        </DialogTitle>
                        <DialogDescription>
                            {tImport("desc") || "Upload a CSV file or paste text (Word, Meaning, Context). True UTF-8 encoding is supported."}
                        </DialogDescription>
                    </DialogHeader>

                    {!canBatchImport ? (
                        <div className="flex flex-col items-center justify-center p-8 py-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">{tImport("premiumTitle") || "Premium Feature"}</h3>
                            <p className="text-muted-foreground max-w-xs text-sm">
                                {tImport("premiumDesc") || "Batch importing vocabulary is exclusively available for Premium users. Upgrade to unlock this and other advanced AI features."}
                            </p>
                            <Button asChild className="mt-4" size="lg">
                                <Link href={`/${locale}/pricing`}>
                                    {tImport("upgradeToPremium") || "Upgrade to Premium"}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Tab Toggle */}
                                <div className="flex p-1 bg-muted/50 rounded-lg w-fit mx-auto border">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("file")}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "file" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {tImport("uploadCsv") || "Upload CSV File"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("text")}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "text" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {tImport("pasteText") || "Paste Text"}
                                    </button>
                                </div>

                                {activeTab === "file" ? (
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
                                    ${parsedPreview.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-muted hover:border-primary/30 hover:bg-muted/30 cursor-pointer'}`}
                                        onClick={() => !parsedPreview.length && fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".csv,.txt"
                                            onChange={handleFileUpload}
                                        />

                                        {parsedPreview.length > 0 ? (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
                                                    <Check className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-700">{tImport("fileReadSuccess") || "File read successfully!"}</p>
                                                    <p className="text-sm text-green-600/80">{tImport("foundWords", { count: parsedPreview.length }) || `Found ${parsedPreview.length} words to import.`}</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setImportText(""); setParsedPreview([]); }} className="mt-2">
                                                    {tImport("chooseDifferent") || "Choose different file"}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                                    <Upload className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{tImport("clickToUpload") || "Click to upload CSV"}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{tImport("utf8Support") || "UTF-8 encoded files are supported."}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="importData" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{tImport("rawText") || "Raw Text"}</Label>
                                        <Textarea
                                            id="importData"
                                            placeholder={`Word, Meaning, Context\napple, quả táo, I eat an apple\n"banana, raw", chuối, He ate it`}
                                            className="min-h-[150px] font-mono text-sm resize-y"
                                            value={importText}
                                            onChange={(e) => handleTextChange(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Data Preview */}
                                {parsedPreview.length > 0 && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5" />
                                                {tImport("dataPreview", { count: parsedPreview.length }) || `Data Preview (${parsedPreview.length} words)`}
                                            </Label>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden flex flex-col max-h-[200px] shadow-sm">
                                            <div className="bg-muted/50 grid grid-cols-3 gap-2 p-2 border-b text-xs font-semibold text-muted-foreground">
                                                <div>{tImport("colWord") || "Word"}</div>
                                                <div>{tImport("colMeaning") || "Meaning"}</div>
                                                <div>{tImport("colContext") || "Context"}</div>
                                            </div>
                                            <div className="overflow-y-auto p-1 divide-y divide-border/50">
                                                {parsedPreview.slice(0, 5).map((w, i) => (
                                                    <div key={i} className="grid grid-cols-3 gap-2 px-2 py-1.5 text-sm hover:bg-muted/30">
                                                        <div className="font-medium truncate" title={w.wordText}>{w.wordText}</div>
                                                        <div className="text-muted-foreground truncate" title={w.customMeaning}>{w.customMeaning || "-"}</div>
                                                        <div className="text-muted-foreground truncate" title={w.contextSentence}>{w.contextSentence || "-"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {parsedPreview.length > 5 && (
                                                <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/20">
                                                    {tImport("moreWords", { count: parsedPreview.length - 5 }) || `+ ${parsedPreview.length - 5} more words`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {importText.trim().length > 0 && parsedPreview.length === 0 && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{tImport("invalidFormat") || "No valid words found. Check your CSV format."}</span>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    {tImport("cancel") || "Cancel"}
                                </Button>
                                <Button type="submit" disabled={isLoading || parsedPreview.length === 0} className="min-w-[120px]">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    {tImport("importNow") || "Import Now"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
