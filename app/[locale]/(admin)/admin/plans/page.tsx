"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { PlanDefinitionDto, CreatePlanDefinitionRequest, UpdatePlanDefinitionRequest } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Box, Loader2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<PlanDefinitionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDefinitionDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ id: string, name: string } | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState("USD");
    const [intervalType, setIntervalType] = useState("Month");
    const [isActive, setIsActive] = useState(true);
    const [featuresJson, setFeaturesJson] = useState("{}");

    const fetchPlans = async () => {
        setLoading(true);
        const res = await adminApi.getPlans();
        if (res.success && res.data) {
            setPlans(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenDialog = (plan?: PlanDefinitionDto) => {
        if (plan) {
            setEditingPlan(plan);
            setName(plan.name);
            setPrice(plan.price);
            setCurrency(plan.currency);
            setIntervalType(plan.intervalType);
            setIsActive(plan.isActive);
            setFeaturesJson(JSON.stringify(plan.features || {}, null, 2));
        } else {
            setEditingPlan(null);
            setName("");
            setPrice(0);
            setCurrency("USD");
            setIntervalType("Month");
            setIsActive(true);
            setFeaturesJson("{}");
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name) {
            toast.error("Plan name is required");
            return;
        }
        let parsedFeatures = {};
        try {
            parsedFeatures = JSON.parse(featuresJson);
        } catch (e) {
            toast.error("Invalid JSON in Features limits.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingPlan) {
                const req: UpdatePlanDefinitionRequest = {
                    name, price, currency, intervalType, isActive, features: parsedFeatures
                };
                const res = await adminApi.updatePlan(editingPlan.id, req);
                if (res.success) toast.success(`Plan '${name}' updated`);
                else toast.error(res.error || "Failed to update plan");
            } else {
                const req: CreatePlanDefinitionRequest = {
                    name, price, currency, intervalType, isActive, features: parsedFeatures
                };
                const res = await adminApi.createPlan(req);
                if (res.success) toast.success(`New plan '${name}' created`);
                else toast.error(res.error || "Failed to create plan");
            }
            setIsDialogOpen(false);
            fetchPlans();
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfig) return;
        try {
            const res = await adminApi.deletePlan(deleteConfig.id);
            if (res.success) {
                toast.success(`Plan '${deleteConfig.name}' deleted`);
                fetchPlans();
            } else {
                toast.error(res.error || "Failed to delete plan");
            }
        } finally {
            setDeleteConfig(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Plan Definitions</h2>
                    <p className="text-muted-foreground mt-1">
                        Configure pricing tiers and their associated feature limits.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Plan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>SaaS Plans</CardTitle>
                    <CardDescription>Available subscription packages for users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Pricing</TableHead>
                                        <TableHead>Billing Interval</TableHead>
                                        <TableHead>Features</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
                            <Box className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">No plans defined</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4 flex max-w-[250px]">
                                Get started by creating your first subscription tier for users.
                            </p>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add First Plan
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Pricing</TableHead>
                                        <TableHead>Billing Interval</TableHead>
                                        <TableHead>Features</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((p) => (
                                        <TableRow key={p.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-semibold text-primary">
                                                    <Box className="h-4 w-4 text-blue-500" />
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-mono text-sm">
                                                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                    {p.price.toFixed(2)} <span className="text-muted-foreground text-xs">{p.currency}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="uppercase text-[10px] bg-muted">{p.intervalType}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    {Object.keys(p.features || {}).length} features
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {p.isActive ? (
                                                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-muted bg-muted/50 text-muted-foreground">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(p)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfig({ id: p.id, name: p.name })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Plan"}</DialogTitle>
                        <DialogDescription>
                            Configure pricing and limits for this SaaS tier.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Pro, Premium, Basic"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="VND">VND (₫)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Billing Interval</Label>
                                <Select value={intervalType} onValueChange={setIntervalType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Month">Monthly</SelectItem>
                                        <SelectItem value="Year">Yearly</SelectItem>
                                        <SelectItem value="Lifetime">Lifetime (One-time)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                                <Label htmlFor="is-active">Active (Visible)</Label>
                            </div>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label>Feature Matrix limits (JSON)</Label>
                            <textarea
                                className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                rows={6}
                                value={featuresJson}
                                onChange={(e) => setFeaturesJson(e.target.value)}
                                placeholder={'{\n  "MAX_WORDS": "5000",\n  "AI_ACCESS": "true"\n}'}
                            ></textarea>
                            <p className="text-[10px] text-muted-foreground">Map Feature Codes to custom values override.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !name}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteConfig}
                onOpenChange={(open) => !open && setDeleteConfig(null)}
                title="Delete Membership Plan"
                description={`Are you sure you want to delete the plan '${deleteConfig?.name}'? This will not cancel existing subscriptions but will prevent new signups.`}
                onConfirm={handleDelete}
                confirmText="Delete Plan"
                variant="destructive"
            />
        </div>
    );
}
