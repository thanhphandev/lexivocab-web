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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Mail, ShieldAlert, Star, Shield, Ban, Activity, RefreshCw, XCircle, LogIn, Loader2, CreditCard, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<UserDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
                setActionLoading(`role-${newRole}`);
                const res = await adminApi.updateRoles(id, { role: newRole });
                if (res.success) {
                    toast.success(`Role updated to ${newRole}`);
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to update role");
                }
                setActionLoading(null);
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
                setActionLoading("toggleStatus");
                const res = await adminApi.updateStatus(id, { isActive: newStatus });
                if (res.success) {
                    toast.success(newStatus ? "Account activated" : "Account banned");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to update status");
                }
                setActionLoading(null);
            }
        });
    };

    const handleAddSubscription = () => {
        openConfirm({
            title: "Gift Subscription",
            description: "Are you sure you want to manually gift 30 days of Premium to this user?",
            confirmText: "Gift 30 Days",
            onConfirm: async () => {
                setActionLoading("addSubscription");
                const res = await adminApi.addSubscription(id, { plan: "Premium", durationDays: 30 });
                if (res.success) {
                    toast.success("Subscription gifted successfully");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to add subscription");
                }
                setActionLoading(null);
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
                setActionLoading("cancelSubscription");
                const res = await adminApi.cancelSubscription(id);
                if (res.success) {
                    toast.success("Subscription revoked");
                    await fetchUser();
                } else {
                    toast.error(res.error || "Failed to revoke subscription");
                }
                setActionLoading(null);
            }
        });
    };

    const handleImpersonate = () => {
        openConfirm({
            title: "Impersonate User",
            description: "Are you sure you want to impersonate this user? You will be logged in as them for 15 minutes to debug issues. After 15 minutes, you will be logged out.",
            confirmText: "Impersonate (15m)",
            onConfirm: async () => {
                setActionLoading("impersonate");
                const res = await adminApi.impersonateUser(id);
                if (res.success) {
                    toast.success("Impersonation successful. Redirecting...");
                    window.location.href = "/"; // Force full reload to reset all states
                } else {
                    toast.error(res.error || "Failed to impersonate");
                    setActionLoading(null);
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                </div>
                
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <h3 className="text-2xl font-semibold tracking-tight">User Not Found</h3>
                <p className="text-muted-foreground text-center max-w-sm">The user you are looking for does not exist, has been permanently removed, or you don't have access.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4 hover:-translate-x-1 transition-transform">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="group hover:-translate-x-1 transition-transform sm:flex-none hidden sm:inline-flex"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:text-primary transition-colors" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{user.fullName}</h2>
                    <p className="text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" /> {user.email}
                        <Badge variant="outline" className="ml-1 sm:ml-2 font-mono text-xs">
                            {user.authProvider || "Local Auth"}
                        </Badge>
                    </p>
                </div>
                <div className="sm:ml-auto flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    {user.isActive ? (
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20 transition-colors shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="transition-colors hover:bg-red-600 shadow-sm">
                            <Ban className="h-3 w-3 mr-1.5" />
                            Banned
                        </Badge>
                    )}
                    <Badge variant="secondary" className="transition-colors hover:bg-secondary/80 shadow-sm">
                        {user.role}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="group/card hover:shadow-md transition-all duration-300 border-t-2 border-t-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="h-5 w-5 text-muted-foreground group-hover/card:text-primary transition-colors" />
                            Usage Stats
                        </CardTitle>
                        <CardDescription>System engagement metrics for this user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="group/stat flex justify-between items-center bg-muted/40 hover:bg-muted p-3.5 rounded-xl border border-transparent hover:border-border transition-all cursor-default">
                            <span className="flex items-center gap-3 font-medium text-muted-foreground group-hover/stat:text-foreground transition-colors">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover/stat:bg-blue-500/20 transition-colors">
                                    <Star className="h-4 w-4" />
                                </div>
                                Total Vocabularies
                            </span>
                            <span className="text-xl font-bold font-mono">{user.totalVocabularies.toLocaleString()}</span>
                        </div>
                        <div className="group/stat flex justify-between items-center bg-muted/40 hover:bg-muted p-3.5 rounded-xl border border-transparent hover:border-border transition-all cursor-default">
                            <span className="flex items-center gap-3 font-medium text-muted-foreground group-hover/stat:text-foreground transition-colors">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover/stat:bg-orange-500/20 transition-colors">
                                    <RefreshCw className="h-4 w-4" />
                                </div>
                                Total Reviews
                            </span>
                            <span className="text-xl font-bold font-mono">{user.totalReviews.toLocaleString()}</span>
                        </div>
                        <div className="group/stat flex justify-between items-center bg-muted/40 hover:bg-muted p-3.5 rounded-xl border border-transparent hover:border-border transition-all cursor-default">
                            <span className="flex items-center gap-3 font-medium text-muted-foreground group-hover/stat:text-foreground transition-colors">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover/stat:bg-green-500/20 transition-colors">
                                    <User className="h-4 w-4" />
                                </div>
                                Account Created
                            </span>
                            <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-500/10 hover:border-red-500/40 hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                            <ShieldAlert className="h-5 w-5" /> Danger Zone Actions
                        </CardTitle>
                        <CardDescription className="text-red-600/70 dark:text-red-400/70">
                            Force override states. Actions are immediate and may cause disruption.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 w-full border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                onClick={() => handleUpdateRole("Admin")}
                                disabled={actionLoading !== null || user.role === "Admin"}
                            >
                                {actionLoading === "role-Admin" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Shield className="h-4 w-4 mr-2" />
                                )}
                                Make Admin
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 w-full hover:bg-muted/80 transition-colors"
                                onClick={() => handleUpdateRole("User")}
                                disabled={actionLoading !== null || user.role === "User"}
                            >
                                {actionLoading === "role-User" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <User className="h-4 w-4 mr-2" />
                                )}
                                Demote to User
                            </Button>
                        </div>
                        <Separator className="bg-red-500/20" />
                        <div className="flex flex-col gap-3">
                            <Button
                                variant="outline"
                                className="w-full border-blue-200 text-blue-700 dark:border-blue-900/50 dark:text-blue-400 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all hover:shadow-sm"
                                onClick={handleImpersonate}
                                disabled={actionLoading !== null || user.role === "Admin"}
                            >
                                {actionLoading === "impersonate" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <LogIn className="h-4 w-4 mr-2" />
                                )}
                                Impersonate User (15m)
                            </Button>
                            <Button
                                variant={user.isActive ? "destructive" : "default"}
                                className="w-full transition-all hover:shadow-sm"
                                onClick={handleToggleStatus}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === "toggleStatus" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Ban className="h-4 w-4 mr-2" />
                                )}
                                {user.isActive ? "Ban Account (Deactivate)" : "Unban Account (Activate)"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="group/subs hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-5 w-5 text-muted-foreground group-hover/subs:text-primary transition-colors" />
                            Subscriptions & Billing
                        </CardTitle>
                        <CardDescription>Manage active plans and view transaction history.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/20 transition-colors shadow-sm"
                            onClick={handleAddSubscription}
                            disabled={actionLoading !== null}
                        >
                            {actionLoading === "addSubscription" ? (
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            ) : (
                                <Star className="h-3.5 w-3.5 mr-2 fill-green-500/20" />
                            )}
                            Gift 30 Days Premium
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={actionLoading !== null || !user.subscriptions?.find(s => s.status === 'Active')}
                            className="transition-colors shadow-sm"
                        >
                            {actionLoading === "cancelSubscription" ? (
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5 mr-2" />
                            )}
                            Revoke Active
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {(!user.subscriptions || user.subscriptions.length === 0) ? (
                        <div className="flex flex-col items-center justify-center text-center py-10 px-4 border-2 border-dashed rounded-xl bg-muted/20">
                            <div className="p-3 bg-muted/50 rounded-full mb-3">
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-semibold mb-1">No subscriptions history</h4>
                            <p className="text-sm text-muted-foreground max-w-sm">This user currently does not have any active or past subscriptions on record.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">External ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.subscriptions?.map((sub) => (
                                        <TableRow key={sub.id} className="group/row hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {sub.plan}
                                                    {sub.status === "Active" && (
                                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={sub.status === "Active" ? "default" : "secondary"}
                                                    className={sub.status === "Active" ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" : ""}
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <span className="capitalize">{sub.provider}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-medium text-foreground">{new Date(sub.startDate).toLocaleDateString()}</span>
                                                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                                                    <span className={!sub.endDate ? "text-green-600 dark:text-green-500 font-medium" : ""}>
                                                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Forever'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground/50 group-hover/row:text-foreground transition-colors text-right truncate max-w-[120px]" title={sub.externalSubscriptionId || 'N/A'}>
                                                {sub.externalSubscriptionId || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
