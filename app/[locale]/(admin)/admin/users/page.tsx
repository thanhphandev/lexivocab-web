"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api/api-client";
import { UserOverviewDto } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Shield, User, Users, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserOverviewDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const res = await adminApi.getUsers(page, 20, debouncedSearch);
        if (res.success && res.data) {
            setUsers(res.data.items);
            setTotalPages(res.data.totalPages || 1);
        }
        setLoading(false);
    }, [page, debouncedSearch]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const getRoleIcon = (role: string) => {
        if (role === "Admin") return <Shield className="h-4 w-4 text-red-500" />;
        return <User className="h-4 w-4 text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Search, filter, and view user details.</p>
                        </div>
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or name..."
                        className="pl-9 bg-card border-muted-foreground/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="font-semibold">User</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Provider</TableHead>
                            <TableHead className="text-right font-semibold">Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-72">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                                        <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                                            <Users className="h-10 w-10 opacity-40" />
                                        </div>
                                        <p className="font-semibold text-lg text-foreground">No users found</p>
                                        <p className="text-sm mt-1 max-w-sm text-center">Try adjusting your search query or check back later.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow
                                    key={u.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.push(`/admin/users/${u.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                {u.fullName?.substring(0, 2).toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <div className="font-medium">{u.fullName}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(u.role)}
                                            <span className="font-medium">{u.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.isActive ? (
                                            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600">Banned</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-[10px]">{u.authProvider || "Local"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
