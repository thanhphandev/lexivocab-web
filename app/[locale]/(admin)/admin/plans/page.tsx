"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { PlanDefinitionDto, CreatePlanDefinitionRequest, UpdatePlanDefinitionRequest, PlanPricingDto, FeatureDefinitionDto } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Box, Loader2, DollarSign, X, Check, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<PlanDefinitionDto[]>([]);
    const [allFeatures, setAllFeatures] = useState<FeatureDefinitionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDefinitionDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ id: string, name: string } | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [pricings, setPricings] = useState<PlanPricingDto[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansRes, featuresRes] = await Promise.all([
                adminApi.getPlans(),
                adminApi.getFeatures()
            ]);

            if (plansRes.success && plansRes.data) {
                setPlans(plansRes.data);
            }
            if (featuresRes.success && featuresRes.data) {
                setAllFeatures(featuresRes.data);
            }
        } catch (error) {
            toast.error("Failed to load plans data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (plan?: PlanDefinitionDto) => {
        if (plan) {
            setEditingPlan(plan);
            setName(plan.name);
            setIsActive(plan.isActive);
            setSelectedFeatures({ ...(plan.features || {}) });
            setPricings(plan.pricings ? [...plan.pricings] : []);
        } else {
            setEditingPlan(null);
            setName("");
            setIsActive(true);

            // Build default features map based on defaultValue from allFeatures
            const defaultFeats: Record<string, string> = {};
            allFeatures.forEach(f => {
                defaultFeats[f.code] = f.defaultValue;
            });
            setSelectedFeatures(defaultFeats);

            setPricings([
                { id: crypto.randomUUID(), billingCycle: "Monthly", price: "0", currency: "VND", durationDays: 30, labelKey: "duration_1m" }
            ]);
        }
        setIsDialogOpen(true);
    };

    const addPricing = () => {
        setPricings([...pricings, { id: crypto.randomUUID(), billingCycle: "Yearly", price: "0", currency: "VND", durationDays: 365, labelKey: "duration_1y" }]);
    };

    const removePricing = (index: number) => {
        const updated = [...pricings];
        updated.splice(index, 1);
        setPricings(updated);
    };

    const updatePricing = (index: number, key: keyof PlanPricingDto, value: any) => {
        const updated = [...pricings];
        updated[index] = { ...updated[index], [key]: value };
        setPricings(updated);
    };

    const handleFeatureChange = (code: string, value: string) => {
        setSelectedFeatures(prev => ({
            ...prev,
            [code]: value
        }));
    };

    const handleSave = async () => {
        if (!name) {
            toast.error("Plan name is required");
            return;
        }
        if (pricings.length === 0) {
            toast.error("You must add at least one pricing tier");
            return;
        }

        // Ensure all prices are strings to avoid backend mapping issues
        const formattedPricings = pricings.map(p => ({
            ...p,
            price: p.price.toString()
        }));

        setIsSaving(true);
        try {
            if (editingPlan) {
                const req: UpdatePlanDefinitionRequest = {
                    name, isActive, features: selectedFeatures, pricings: formattedPricings
                };
                const res = await adminApi.updatePlan(editingPlan.id, req);
                if (res.success) {
                    toast.success(`Plan '${name}' updated`);
                    setIsDialogOpen(false);
                    fetchData();
                } else toast.error(res.error || "Failed to update plan");
            } else {
                const req: CreatePlanDefinitionRequest = {
                    name, isActive, features: selectedFeatures, pricings: formattedPricings
                };
                const res = await adminApi.createPlan(req);
                if (res.success) {
                    toast.success(`New plan '${name}' created`);
                    setIsDialogOpen(false);
                    fetchData();
                } else toast.error(res.error || "Failed to create plan");
            }
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
                fetchData();
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
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 shadow-sm transition-all hover:shadow-md">
                        <Box className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Plan Definitions</h2>
                        <p className="text-muted-foreground mt-0.5">
                            Manage subscription packages, pricing tiers, and bundled features.
                        </p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Add Plan
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle>SaaS Plans</CardTitle>
                    <CardDescription>Available subscription packages for users.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Pricing Tiers</TableHead>
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
                            <div className="p-4 rounded-full bg-muted/50 mb-4">
                                <Box className="h-10 w-10 text-muted-foreground/30" />
                            </div>
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
                                        <TableHead>Pricing Tiers</TableHead>
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
                                                    <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                                                        <Box className="h-3.5 w-3.5" />
                                                    </div>
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                                                    {(p.pricings && p.pricings.length > 0) ? p.pricings.map((pricing: any) => (
                                                        <Badge key={pricing.id} variant="secondary" className="font-mono text-[10px] bg-background border shadow-sm px-2 py-0.5 font-medium">
                                                            <span className="text-muted-foreground mr-1">{pricing.billingCycle?.toUpperCase()}</span>
                                                            <span className="text-primary">{Number(pricing.price).toFixed(0)} {pricing.currency}</span>
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-xs text-muted-foreground italic">No Pricing</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-normal border-dashed">
                                                    {Object.keys(p.features || {}).length} features bundled
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {p.isActive ? (
                                                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-muted bg-muted/50 text-muted-foreground">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:!bg-blue-500/10" onClick={() => handleOpenDialog(p)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:!bg-red-500/10" onClick={() => setDeleteConfig({ id: p.id, name: p.name })}>
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Plan"}</DialogTitle>
                        <DialogDescription>
                            Configure pricing tiers and feature quotas for this subscription plan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-8 py-4">
                        {/* Basic Info Section */}
                        <div className="grid gap-4 bg-muted/20 p-4 rounded-xl border">
                            <div className="flex items-center gap-2 mb-2">
                                <Box className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">General Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Pro, Premium, Basic"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="flex items-center pl-0 md:pl-4 pt-4 md:pt-6">
                                    <div className="flex items-center space-x-2 bg-background border px-4 py-2 rounded-md shadow-sm">
                                        <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                                        <Label htmlFor="is-active" className="cursor-pointer">Active (Visible to users)</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Tiers Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <Label className="text-base font-semibold">Pricing Tiers</Label>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addPricing} className="h-8">
                                    <Plus className="h-3 w-3 mr-1" /> Add Tier
                                </Button>
                            </div>

                            <div className="space-y-3 px-1 pt-2">
                                {pricings.length === 0 && (
                                    <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-muted/10">
                                        No pricing tiers created. Add one to allow users to subscribe.
                                    </div>
                                )}

                                {pricings.map((pricing, index) => (
                                    <div key={pricing.id} className="relative grid grid-cols-1 lg:grid-cols-12 gap-3 items-end bg-card p-4 rounded-lg border shadow-sm transition-all hover:shadow-md">
                                        <div className="lg:col-span-3 grid gap-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Billing Cycle</Label>
                                            <Select value={pricing.billingCycle} onValueChange={(val) => updatePricing(index, "billingCycle", val)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Free"><span className="font-semibold">Free</span></SelectItem>
                                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="Annual">Annual</SelectItem>
                                                    <SelectItem value="SemiAnnual">Semi Annual</SelectItem>
                                                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="lg:col-span-3 grid gap-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                                            <Input
                                                type="number"
                                                className="h-9 font-mono bg-background focus:bg-background"
                                                placeholder="0.00"
                                                value={pricing.price}
                                                onChange={(e) => updatePricing(index, "price", e.target.value)}
                                            />
                                        </div>
                                        <div className="lg:col-span-2 grid gap-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Currency</Label>
                                            <Select value={pricing.currency} onValueChange={(val) => updatePricing(index, "currency", val)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VND">VND</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="lg:col-span-3 grid gap-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Duration (Days)</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-background focus:bg-background"
                                                placeholder="e.g 30"
                                                value={pricing.durationDays || ""}
                                                onChange={(e) => updatePricing(index, "durationDays", e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                            <p className="text-[9px] text-muted-foreground absolute -bottom-4 hidden lg:block">Leave empty for Lifetime</p>
                                        </div>
                                        <div className="lg:col-span-1 flex items-center justify-end lg:justify-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removePricing(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features Matrix UI */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1 border-b">
                                <Label className="text-base font-semibold">Feature Capabilities</Label>
                                <Badge variant="secondary" className="text-[10px] bg-muted">{allFeatures.length} available</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                {allFeatures.length === 0 ? (
                                    <div className="col-span-full text-sm text-muted-foreground py-4 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading feature definitions...
                                    </div>
                                ) : (
                                    allFeatures.map(feature => {
                                        const isBoolean = feature.valueType.toLowerCase() === "boolean";
                                        const currentValue = selectedFeatures[feature.code] ?? feature.defaultValue;
                                        const isBoolTrue = currentValue === "true" || currentValue === "1";

                                        return (
                                            <div key={feature.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-card border shadow-sm">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Label className="font-mono text-xs font-bold truncate" title={feature.code}>{feature.code}</Label>
                                                        {isBoolean ? (
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm uppercase tracking-wider text-muted-foreground font-mono">Bool</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm uppercase tracking-wider text-muted-foreground font-mono">{feature.valueType}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate" title={feature.description}>{feature.description}</p>
                                                </div>

                                                <div className="flex-shrink-0 flex items-center justify-end w-full sm:w-1/3">
                                                    {isBoolean ? (
                                                        <div className="flex items-center gap-2 border rounded-full px-2 py-1 bg-background">
                                                            <Switch
                                                                checked={isBoolTrue}
                                                                onCheckedChange={(checked) => handleFeatureChange(feature.code, checked ? "true" : "false")}
                                                                className="data-[state=checked]:bg-green-500"
                                                            />
                                                            {isBoolTrue ? <Check className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground opacity-50" />}
                                                        </div>
                                                    ) : (
                                                        <Input
                                                            className="h-8 w-full min-w-[80px] text-xs font-mono text-center bg-background"
                                                            value={currentValue}
                                                            onChange={(e) => handleFeatureChange(feature.code, e.target.value)}
                                                            placeholder={feature.defaultValue}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-4 border-t px-6">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !name}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Plan Configurations
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
