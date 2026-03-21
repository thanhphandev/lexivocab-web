"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { AdminCouponDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<AdminCouponDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<string>("0"); // 0: Percentage, 1: Fixed
    const [discountValue, setDiscountValue] = useState("");
    const [currency, setCurrency] = useState<string>("VND");
    const [maxUses, setMaxUses] = useState("");
    const [isActive, setIsActive] = useState(true);

    const fetchCoupons = async () => {
        setLoading(true);
        const res = await adminApi.coupons.getList(1, 100);
        if (res.success) {
            setCoupons(res.data.items);
        } else {
            toast.error(res.error || "Failed to fetch coupons");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenDialog = (coupon?: AdminCouponDto) => {
        if (coupon) {
            setEditingId(coupon.id);
            setCode(coupon.code);
            setDiscountType(coupon.discountType.toString());
            setDiscountValue(coupon.discountValue.toString());
            setCurrency(coupon.currency || "VND");
            setMaxUses(coupon.maxUses?.toString() || "");
            setIsActive(coupon.isActive);
        } else {
            setEditingId(null);
            setCode("");
            setDiscountType("0");
            setDiscountValue("");
            setCurrency("VND");
            setMaxUses("");
            setIsActive(true);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!code || !discountValue) {
            toast.error("Please fill in the required fields");
            return;
        }

        const data = {
            code,
            discountType: parseInt(discountType),
            discountValue: parseFloat(discountValue),
            currency: discountType === "1" ? currency : null,
            maxUses: maxUses ? parseInt(maxUses) : null,
            startsAt: new Date().toISOString(), // Default to now
            isActive
        };

        let res;
        if (editingId) {
            res = await adminApi.coupons.update(editingId, data);
        } else {
            res = await adminApi.coupons.create(data);
        }

        if (res.success) {
            toast.success(`Coupon ${editingId ? "updated" : "created"} successfully`);
            setIsDialogOpen(false);
            fetchCoupons();
        } else {
            toast.error(res.error || "Failed to save coupon");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        
        const res = await adminApi.coupons.delete(id);
        if (res.success) {
            toast.success("Coupon deleted successfully");
            fetchCoupons();
        } else {
            toast.error(res.error || "Failed to delete coupon");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                        <Ticket className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
                        <p className="text-muted-foreground mt-0.5">
                            Manage promotional discount codes for marketing campaigns.
                        </p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary">
                            <Plus className="h-4 w-4" /> Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent key={editingId || "new"} className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
                            <DialogDescription>
                                Set up discount codes to incentivize upgrades.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
                                <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select value={discountType} onValueChange={setDiscountType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Percentage (%)</SelectItem>
                                            <SelectItem value="1">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discountValue">Value <span className="text-red-500">*</span></Label>
                                    <Input id="discountValue" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="e.g. 20" />
                                </div>
                                {discountType === "1" && (
                                    <div className="grid gap-2">
                                        <Label>Currency</Label>
                                        <Select value={currency} onValueChange={setCurrency}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="VND">VND</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                                <Input id="maxUses" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Leave blank for unlimited" />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                                <Label htmlFor="active">Active</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-md overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[150px]">Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No coupons found.</TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-medium tracking-wider">{coupon.code}</TableCell>
                                        <TableCell>
                                            {coupon.discountType === 0 
                                                ? <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">{coupon.discountValue}% OFF</Badge>
                                                : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{coupon.currency === "VND" ? "" : "$"}{coupon.discountValue} {coupon.currency === "VND" ? "VND" : ""} OFF</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {coupon.currentUses}
                                                <span className="text-muted-foreground font-normal">
                                                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ' (unlimited)'}
                                                </span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.isActive 
                                                ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                                                : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
