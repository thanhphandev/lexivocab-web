"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api/api-client";
import { MasterVocabularyDto, CreateMasterVocabularyRequest, UpdateMasterVocabularyRequest } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, BookOpen, Loader2, Volume2, Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import Papa from "papaparse";

export default function AdminVocabulariesPage() {
    const [vocabularies, setVocabularies] = useState<MasterVocabularyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfig, setDeleteConfig] = useState<{ id: string, word: string } | null>(null);
    
    const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");
    
    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVocab, setEditingVocab] = useState<MasterVocabularyDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [wordText, setWordText] = useState("");
    const [meaning, setMeaning] = useState("");
    const [phoneticUk, setPhoneticUk] = useState("");
    const [phoneticUs, setPhoneticUs] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [cefrLevel, setCefrLevel] = useState("");
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search, activeTab]);

    const loadVocabularies = useCallback(async () => {
        setLoading(true);
        const isApproved = activeTab === "approved";
        const res = await adminApi.getMasterVocabularies(page, 20, debouncedSearch, isApproved);
        if (res.success && res.data) {
            setVocabularies(res.data.items);
            setTotalPages(res.data.totalPages || 1);
        }
        setLoading(false);
    }, [page, debouncedSearch, activeTab]);

    useEffect(() => {
        loadVocabularies();
    }, [loadVocabularies]);

    const handleOpenDialog = (vocab?: MasterVocabularyDto) => {
        if (vocab) {
            setEditingVocab(vocab);
            setWordText(vocab.word);
            setMeaning(vocab.meaning || "");
            setPhoneticUk(vocab.phoneticUk || "");
            setPhoneticUs(vocab.phoneticUs || "");
            setAudioUrl(vocab.audioUrl || "");
            setCefrLevel(vocab.cefrLevel || "");
        } else {
            setEditingVocab(null);
            setWordText("");
            setMeaning("");
            setPhoneticUk("");
            setPhoneticUs("");
            setAudioUrl("");
            setCefrLevel("");
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!wordText || !meaning) {
            toast.error("Word Text and Meaning are required");
            return;
        }
        
        setIsSaving(true);
        try {
            if (editingVocab) {
                const req: UpdateMasterVocabularyRequest = {
                    meaning: meaning || undefined, 
                    phoneticUk: phoneticUk || undefined, 
                    phoneticUs: phoneticUs || undefined, 
                    audioUrl: audioUrl || undefined, 
                    cefrLevel: cefrLevel || undefined 
                };
                const res = await adminApi.updateMasterVocabulary(editingVocab.id, req);
                if (res.success) toast.success("Word updated successfully");
                else toast.error(res.error || "Failed to update word");
            } else {
                const req: CreateMasterVocabularyRequest = {
                    word: wordText, meaning, phoneticUk, phoneticUs, audioUrl, cefrLevel
                };
                const res = await adminApi.createMasterVocabulary(req);
                if (res.success) toast.success("New word added to master dictionary");
                else toast.error(res.error || "Failed to create word");
            }
            setIsDialogOpen(false);
            loadVocabularies();
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoFill = async () => {
        if (!wordText) {
            toast.error("Please enter a word first.");
            return;
        }
        setIsAutoFilling(true);
        try {
            const res = await adminApi.lookupMasterVocabulary(wordText);
            if (!res.success) {
                toast.error(res.error || "Word not found in dictionary.");
                return;
            }
            if (res.data) {
                setMeaning(res.data.meaning || meaning);
                setPhoneticUk(res.data.phoneticUk || phoneticUk);
                setPhoneticUs(res.data.phoneticUs || phoneticUs);
                toast.success("Definition auto-filled from internet!");
            }
        } catch(e) {
            toast.error("Failed to fetch word definition.");
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const items = results.data.map((row: any) => ({
                        word: row.Word || row.word,
                        meaning: row.Meaning || row.meaning,
                        phoneticUk: row.PhoneticUk || row.phoneticUk || null,
                        phoneticUs: row.PhoneticUs || row.phoneticUs || null,
                        cefrLevel: row.CefrLevel || row.cefrLevel || null,
                        partOfSpeech: row.PartOfSpeech || row.partOfSpeech || null,
                    })).filter(item => !!item.word);

                    if (items.length === 0) {
                        toast.error("No valid headers found. Please use CSV with headers: word, meaning");
                        return;
                    }

                    toast.loading(`Importing ${items.length} words...`);
                    const res = await adminApi.createMasterVocabularyBatch({ items });
                    toast.dismiss();
                    
                    if (res.success) {
                        toast.success(`Successfully imported ${res.data?.createdCount || 0} words.`);
                        loadVocabularies();
                    } else {
                        toast.error(res.error || "Failed to import vocabulary.");
                    }
                } catch (err) {
                    toast.error("An error occurred during import.");
                } finally {
                    setIsImporting(false);
                    e.target.value = ""; // reset input
                }
            },
            error: (error) => {
                toast.error("Failed to parse CSV file: " + error.message);
                setIsImporting(false);
                e.target.value = "";
            }
        });
    };

    const handleDelete = async () => {
        if (!deleteConfig) return;
        
        try {
            const res = await adminApi.deleteMasterVocabulary(deleteConfig.id);
            if (res.success) {
                toast.success(`'${deleteConfig.word}' deleted from global dictionary`);
                loadVocabularies();
            } else {
                toast.error(res.error || "Failed to delete word");
            }
        } finally {
            setDeleteConfig(null);
        }
    };

    const handleApprove = async (id: string, currentVocab: MasterVocabularyDto) => {
        try {
            const res = await adminApi.approveMasterVocabulary(id);
            if (res.success) {
                toast.success(`Word approved successfully`);
                loadVocabularies();
            } else {
                toast.error(res.error || "Failed to approve word");
            }
        } catch (error) {
            toast.error("Failed to approve word");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20">
                        <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Master Vocabularies</h2>
                        <p className="text-muted-foreground mt-0.5">
                            Global seed list of words verified by the platform.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search word..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isImporting}
                        />
                        <Button variant="secondary" className="shrink-0 group-hover/btn:bg-accent" disabled={isImporting}>
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                            Import CSV
                        </Button>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> Add Word
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="approved" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="approved">Approved List</TabsTrigger>
                    <TabsTrigger value="pending">Community Pending</TabsTrigger>
                </TabsList>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Word</TableHead>
                                <TableHead>Meaning</TableHead>
                                <TableHead>CEFR</TableHead>
                                <TableHead>Pronunciation</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="pl-6"><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : vocabularies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-72">
                                    <div className="flex flex-col items-center justify-center text-center p-8">
                                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                                            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-lg font-medium">{activeTab === "pending" ? "No community suggestions pending" : "No vocabulary words found"}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
                                            {activeTab === "pending" ? "Community contributions will appear here for review." : "The global dictionary is currently empty. Start by adding some verified terms."}
                                        </p>
                                        {activeTab !== "pending" && (
                                            <Button variant="outline" onClick={() => handleOpenDialog()}>
                                                <Plus className="mr-2 h-4 w-4" /> Add First Word
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            vocabularies.map((v) => (
                                <TableRow key={v.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="pl-6 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <span className="text-primary font-bold">{v.word}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground italic">
                                        {v.meaning}
                                    </TableCell>
                                    <TableCell>
                                        {v.cefrLevel ? (
                                            <Badge variant="outline" className="font-mono text-[10px] border-primary/20 bg-primary/5 text-primary">
                                                {v.cefrLevel.toUpperCase()}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground/40 text-xs italic">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-[11px] font-mono text-muted-foreground/80">
                                            {v.phoneticUk && <span className="flex items-center gap-1"><span className="text-[9px] font-bold text-muted-foreground/40">UK</span> {v.phoneticUk}</span>}
                                            {v.phoneticUs && <span className="flex items-center gap-1"><span className="text-[9px] font-bold text-muted-foreground/40">US</span> {v.phoneticUs}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            {activeTab === "pending" && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 mr-2" onClick={() => handleApprove(v.id, v)} title="Approve Word">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {v.audioUrl && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Has audio">
                                                    <Volume2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(v)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfig({ id: v.id, word: v.word })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
            </Tabs>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-sm font-medium">Page {page} of {totalPages}</div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVocab ? "Edit Master Word" : "Add Master Word"}</DialogTitle>
                        <DialogDescription>
                            Define a globally accessible dictionary item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="word">Word</Label>
                                <div className="flex gap-2">
                                    <Input id="word" value={wordText} onChange={(e) => setWordText(e.target.value)} disabled={!!editingVocab} />
                                    {!editingVocab && (
                                        <Button variant="outline" size="icon" title="Auto-fill from Dictionary" onClick={handleAutoFill} disabled={isAutoFilling}>
                                            {isAutoFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cefr">CEFR Level (e.g. A1, B2)</Label>
                                <Input id="cefr" value={cefrLevel} onChange={(e) => setCefrLevel(e.target.value.toUpperCase())} maxLength={2} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meaning">Meaning / Translation</Label>
                            <Input id="meaning" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="uk">UK Phonetic</Label>
                                <Input id="uk" value={phoneticUk} onChange={(e) => setPhoneticUk(e.target.value)} placeholder="/həˈləʊ/" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="us">US Phonetic</Label>
                                <Input id="us" value={phoneticUs} onChange={(e) => setPhoneticUs(e.target.value)} placeholder="/həˈloʊ/" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="audio">Audio URL</Label>
                            <Input id="audio" type="url" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !wordText || !meaning}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Word
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteConfig}
                onOpenChange={(open) => !open && setDeleteConfig(null)}
                title="Delete Global Word"
                description={`Are you sure you want to completely delete '${deleteConfig?.word}' from global dictionary? Customers will lose access to this verified term.`}
                onConfirm={handleDelete}
                confirmText="Delete Word"
                variant="destructive"
            />
        </div>
    );
}
