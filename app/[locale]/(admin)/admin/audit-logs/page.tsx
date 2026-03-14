"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { adminApi } from "@/lib/api/api-client";
import { AuditLogDto, PagedResult } from "@/lib/api/types";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
    const t = useTranslations("Admin.auditLogs");
    const [data, setData] = useState<PagedResult<AuditLogDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminApi.getAuditLogs(page, 20, debouncedSearch);
            if (res.success) {
                setData(res.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
                <p className="text-muted-foreground mt-2">
                    {t("subtitle")}
                </p>
            </div>

            <div className="flex bg-card p-4 rounded-xl border items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">{t("table.date")}</TableHead>
                                <TableHead className="w-[200px]">{t("table.user")}</TableHead>
                                <TableHead className="w-[150px]">{t("table.action")}</TableHead>
                                <TableHead className="w-[150px]">{t("table.entity")}</TableHead>
                                <TableHead className="min-w-[200px]">{t("table.details")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : !data || data.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                            <p className="font-medium">{t("empty")}</p>
                                            <p className="text-sm">{t("emptySubtitle")}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{log.userEmail || "System"}</div>
                                            {log.userId && <div className="text-xs text-muted-foreground">{log.userId}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{log.entityType}</div>
                                            {log.entityId && <div className="text-xs text-muted-foreground font-mono">{log.entityId}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground line-clamp-2" title={log.additionalInfo || ""}>
                                                {log.additionalInfo || "-"}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {page} of {data.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= data.totalPages}
                        onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
