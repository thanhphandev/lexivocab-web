"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api/api-client";
import { UserOverviewDto } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Shield, User, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
        if (role === "Premium") return <Crown className="h-4 w-4 text-yellow-500" />;
        return <User className="h-4 w-4 text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
                    <p className="text-muted-foreground mt-1">
                        Search, filter, and view user details.
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or name..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead className="text-right">Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex justify-center">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow
                                    key={u.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/admin/users/${u.id}`)}
                                >
                                    <TableCell>
                                        <div className="font-medium">{u.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(u.role)}
                                            <span>{u.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.isActive ? (
                                            <Badge variant="outline" className="border-green-500 text-green-600">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-red-500 text-red-600">Banned</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-[10px]">{u.authProvider || "Local"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {new Date(u.createdAt).toLocaleDateString()}
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
