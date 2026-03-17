"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { FeatureDefinitionDto, CreateFeatureDefinitionRequest, UpdateFeatureDefinitionRequest } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Key, Loader2, PlaySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export default function AdminFeaturesPage() {
    const [features, setFeatures] = useState<FeatureDefinitionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<FeatureDefinitionDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ id: string, code: string } | null>(null);

    // Form state
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [valueType, setValueType] = useState("boolean");
    const [defaultValue, setDefaultValue] = useState("");

    const fetchFeatures = async () => {
        setLoading(true);
        const res = await adminApi.getFeatures();
        if (res.success && res.data) {
            setFeatures(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleOpenDialog = (feature?: FeatureDefinitionDto) => {
        if (feature) {
            setEditingFeature(feature);
            setCode(feature.code);
            setDescription(feature.description);
            setValueType(feature.valueType);
            setDefaultValue(feature.defaultValue);
        } else {
            setEditingFeature(null);
            setCode("");
            setDescription("");
            setValueType("boolean");
            setDefaultValue("false");
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!code) {
            toast.error("Feature code is required");
            return;
        }
        setIsSaving(true);
        try {
            if (editingFeature) {
                const req: UpdateFeatureDefinitionRequest = { description, valueType, defaultValue };
                const res = await adminApi.updateFeature(editingFeature.id, req);
                if (res.success) toast.success(`Feature '${code}' updated`);
                else toast.error(res.error || "Failed to update feature");
            } else {
                const req: CreateFeatureDefinitionRequest = { code, description, valueType, defaultValue };
                const res = await adminApi.createFeature(req);
                if (res.success) toast.success(`New feature '${code}' created`);
                else toast.error(res.error || "Failed to create feature");
            }
            setIsDialogOpen(false);
            fetchFeatures();
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfig) return;
        try {
            const res = await adminApi.deleteFeature(deleteConfig.id);
            if (res.success) {
                toast.success(`Feature '${deleteConfig.code}' deleted`);
                fetchFeatures();
            } else {
                toast.error(res.error || "Failed to delete feature");
            }
        } finally {
            setDeleteConfig(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 shadow-sm transition-all hover:shadow-md">
                        <Key className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Feature Definitions</h2>
                        <p className="text-muted-foreground mt-0.5">
                            Manage granular system capabilities and quotas used in SaaS plans.
                        </p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle>System Features</CardTitle>
                    <CardDescription>All defined capabilities that can be bundled into Plans.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Feature Code</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Default Limit</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : features.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-60">
                                            <div className="flex flex-col items-center justify-center text-center p-8">
                                                <div className="p-4 rounded-full bg-muted/50 mb-4">
                                                    <Key className="h-10 w-10 text-muted-foreground/30" />
                                                </div>
                                                <h3 className="text-lg font-medium">No features defined</h3>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                                    System capabilities allow you to control access levels across different plans.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    features.map((f) => (
                                        <TableRow key={f.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-mono">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                                                        <Key className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-bold text-primary">{f.code}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm italic">{f.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="uppercase text-[10px] bg-muted/50 text-muted-foreground border-none">
                                                    {f.valueType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono border">
                                                    {f.defaultValue}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(f)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfig({ id: f.id, code: f.code })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFeature ? `Edit Feature: ${editingFeature.code}` : "Create New Feature"}</DialogTitle>
                        <DialogDescription>
                            Define a system capability that can be toggled or metered across the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Feature Code</Label>
                            <Input
                                id="code"
                                placeholder="e.g. MAX_WORDS, AI_ACCESS"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                disabled={!!editingFeature}
                                className="font-mono"
                            />
                            {!editingFeature && (
                                <p className="text-[10px] text-muted-foreground">Unique identifier used in code. Cannot be changed later.</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input
                                id="desc"
                                placeholder="e.g. Maximum vocabulary words allowed"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Value Type</Label>
                                <Select value={valueType} onValueChange={setValueType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="boolean">Boolean (Toggle)</SelectItem>
                                        <SelectItem value="integer">Integer (Quota)</SelectItem>
                                        <SelectItem value="string">String</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="default">Default Limit/Value</Label>
                                <Input
                                    id="default"
                                    placeholder={valueType === "boolean" ? "false" : "0"}
                                    value={defaultValue}
                                    onChange={(e) => setDefaultValue(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !code}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Feature
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteConfig}
                onOpenChange={(open) => !open && setDeleteConfig(null)}
                title="Delete Feature Definition"
                description={`Are you sure you want to delete the feature '${deleteConfig?.code}'? This may break active plans or historical records referencing this capability.`}
                onConfirm={handleDelete}
                confirmText="Delete Feature"
                variant="destructive"
            />
        </div>
    );
}
