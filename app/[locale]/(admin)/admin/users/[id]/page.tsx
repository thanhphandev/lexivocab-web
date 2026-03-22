"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/api-client";
import { UserDetailDto } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, ShieldAlert, Star, Shield, Ban, Activity, RefreshCw, XCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<UserDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Confirmation States
    const [confirmConfig, setConfirmConfig] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => Promise<void> | void;
        variant?: "destructive" | "default";
        confirmText?: string;
    }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });

    const openConfirm = (config: Omit<typeof confirmConfig, "open">) => {
        setConfirmConfig({ ...config, open: true });
    };

    const fetchUser = useCallback(async () => {
        setLoading(true);
        const res = await adminApi.getUserDetail(id);
        if (res.success && res.data) {
            setUser(res.data);
        } else if (!res.success) {
            toast.error(res.error || "Failed to fetch user");
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUpdateRole = (newRole: string) => {
        openConfirm({
            title: "Change User Role",
            description: `Are you sure you want to change this user's role to ${newRole}?`,
            confirmText: "Change Role",
            onConfirm: async () => {
                setActionLoading(true);
                const res = await adminApi.updateRoles(id, { role: newRole });
                if (res.success) {
                    toast.success(`Role updated to ${newRole}`);
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to update role");
                }
                setActionLoading(false);
            }
        });
    };

    const handleToggleStatus = () => {
        if (!user) return;
        const newStatus = !user.isActive;
        openConfirm({
            title: newStatus ? "Activate Account" : "Ban Account",
            description: `Are you sure you want to ${newStatus ? 'activate' : 'ban'} this user?`,
            confirmText: newStatus ? "Activate" : "Ban",
            variant: newStatus ? "default" : "destructive",
            onConfirm: async () => {
                setActionLoading(true);
                const res = await adminApi.updateStatus(id, { isActive: newStatus });
                if (res.success) {
                    toast.success(newStatus ? "Account activated" : "Account banned");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to update status");
                }
                setActionLoading(false);
            }
        });
    };

    const handleAddSubscription = () => {
        openConfirm({
            title: "Gift Subscription",
            description: "Are you sure you want to manually gift 30 days of Premium to this user?",
            confirmText: "Gift 30 Days",
            onConfirm: async () => {
                setActionLoading(true);
                const res = await adminApi.addSubscription(id, { plan: "Premium", durationDays: 30 });
                if (res.success) {
                    toast.success("Subscription gifted successfully");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to add subscription");
                }
                setActionLoading(false);
            }
        });
    };

    const handleCancelSubscription = () => {
        openConfirm({
            title: "Revoke Subscription",
            description: "Are you sure you want to cancel the user's active subscription and revoke premium privileges?",
            confirmText: "Revoke Premium",
            variant: "destructive",
            onConfirm: async () => {
                setActionLoading(true);
                const res = await adminApi.cancelSubscription(id);
                if (res.success) {
                    toast.success("Subscription revoked");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to revoke subscription");
                }
                setActionLoading(false);
            }
        });
    };

    const handleImpersonate = () => {
        openConfirm({
            title: "Impersonate User",
            description: "Are you sure you want to impersonate this user? You will be logged in as them for 15 minutes to debug issues. After 15 minutes, you will be logged out.",
            confirmText: "Impersonate (15m)",
            onConfirm: async () => {
                setActionLoading(true);
                const res = await adminApi.impersonateUser(id);
                if (res.success) {
                    toast.success("Impersonation successful. Redirecting...");
                    window.location.href = "/"; // Force full reload to reset all states
                } else {
                    toast.error(res.error || "Failed to impersonate");
                    setActionLoading(false);
                }
            }
        });
    };

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{user.fullName}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" /> {user.email}
                        <Badge variant="outline" className="ml-2">
                            {user.authProvider || "Local Auth"}
                        </Badge>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {user.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">Active</Badge>
                    ) : (
                        <Badge variant="destructive" className="text-sm">Banned</Badge>
                    )}
                    <Badge variant="secondary" className="text-sm">
                        {user.role}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Stats</CardTitle>
                        <CardDescription>System engagement metrics for this user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                            <span className="flex items-center gap-2 font-medium">
                                <Star className="h-4 w-4 text-blue-500" /> Total Vocabularies
                            </span>
                            <span className="text-xl font-bold">{user.totalVocabularies.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                            <span className="flex items-center gap-2 font-medium">
                                <Activity className="h-4 w-4 text-orange-500" /> Total Reviews
                            </span>
                            <span className="text-xl font-bold">{user.totalReviews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                            <span className="flex items-center gap-2 font-medium">
                                <RefreshCw className="h-4 w-4 text-green-500" /> Account Created
                            </span>
                            <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-500/10">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" /> Danger Zone Actions
                        </CardTitle>
                        <CardDescription>
                            Force override states. Actions are immediate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 w-full"
                                onClick={() => handleUpdateRole("Admin")}
                                disabled={actionLoading || user.role === "Admin"}
                            >
                                <Shield className="h-4 w-4 mr-2 text-red-500" /> Make Admin
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 w-full"
                                onClick={() => handleUpdateRole("User")}
                                disabled={actionLoading || user.role === "User"}
                            >
                                <User className="h-4 w-4 mr-2" /> Demote to User
                            </Button>
                        </div>
                        <Separator className="bg-red-500/10" />
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                onClick={handleImpersonate}
                                disabled={actionLoading || user.role === "Admin"}
                            >
                                <LogIn className="h-4 w-4 mr-2" /> Impersonate (15m)
                            </Button>
                            <Button
                                variant={user.isActive ? "destructive" : "default"}
                                className="w-full"
                                onClick={handleToggleStatus}
                                disabled={actionLoading}
                            >
                                <Ban className="h-4 w-4 mr-2" />
                                {user.isActive ? "Ban Account (Deactivate)" : "Unban Account (Activate)"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Subscriptions & Billing</CardTitle>
                        <CardDescription>Manage active plans and view history.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={handleAddSubscription}
                            disabled={actionLoading}
                        >
                            Gift 30 Days Premium
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={actionLoading || !user.subscriptions.find(s => s.status === 'Active')}
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Revoke Active
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {(!user.subscriptions || user.subscriptions.length === 0) ? (
                        <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/10">
                            No subscriptions found on record.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>External ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.subscriptions?.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.plan}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.status === "Active" ? "default" : "secondary"}>
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{sub.provider}</TableCell>
                                        <TableCell className="text-xs">
                                            {new Date(sub.startDate).toLocaleDateString()} - <br />
                                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Forever'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {sub.externalSubscriptionId || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmConfig.open}
                onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, open }))}
                title={confirmConfig.title}
                description={confirmConfig.description}
                onConfirm={confirmConfig.onConfirm}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
            />
        </div>
    );
}
