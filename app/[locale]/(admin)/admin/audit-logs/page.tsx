"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Shield,
    Clock,
    Activity,
    Filter,
    X,
    RefreshCw,
    Calendar,
} from "lucide-react";

import { AUDIT_ACTIONS, ACTION_CONFIG, PAGE_SIZE_OPTIONS, ACTION_LABELS } from "./_components/constants";
import { formatDuration, getDurationColor } from "./_components/helpers";
import { ActionBadge, StatusIndicator, SkeletonRow, DetailDialog } from "./_components/audit-log-components";

// ─── Main Page ──────────────────────────────────────────
export default function AuditLogsPage() {
    const [data, setData] = useState<PagedResult<AuditLogDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [actionFilter, setActionFilter] = useState<string>("");
    const [entityFilter, setEntityFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (actionFilter) count++;
        if (entityFilter) count++;
        if (statusFilter) count++;
        if (fromDate) count++;
        if (toDate) count++;
        return count;
    }, [actionFilter, entityFilter, statusFilter, fromDate, toDate]);

    // Unique entity types from current data
    const entityTypes = useMemo(() => {
        if (!data?.items) return [];
        const types = new Set(data.items.map((l) => l.entityType).filter(Boolean));
        return Array.from(types).sort();
    }, [data]);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters: Record<string, string> = {};
            if (debouncedSearch) filters.search = debouncedSearch;
            if (actionFilter) filters.action = actionFilter;
            if (entityFilter) filters.entityType = entityFilter;
            if (fromDate) filters.fromDate = fromDate;
            if (toDate) filters.toDate = toDate;

            const res = await adminApi.getAuditLogs(page, pageSize, filters);
            if (res.success) {
                let items = (res.data as PagedResult<AuditLogDto>).items;
                // Client-side status filter (API doesn't have isSuccess filter param)
                if (statusFilter === "success") {
                    items = items.filter((i) => i.isSuccess);
                } else if (statusFilter === "failed") {
                    items = items.filter((i) => !i.isSuccess);
                }
                setData({ ...res.data as PagedResult<AuditLogDto>, items });
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, debouncedSearch, actionFilter, entityFilter, statusFilter, fromDate, toDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const clearAllFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setActionFilter("");
        setEntityFilter("");
        setStatusFilter("");
        setFromDate("");
        setToDate("");
        setPage(1);
    };

    // Pagination helpers
    const from = data ? (page - 1) * pageSize + 1 : 0;
    const to = data ? Math.min(page * pageSize, data.totalCount) : 0;

    return (
        <div className="space-y-5">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
                            <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Real-time monitoring of all system activities and user actions</p>
                        </div>
                    </div>
                </div>
                {data && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{data.totalCount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">total logs</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchLogs}
                            disabled={isLoading}
                            className="gap-1.5"
                            title="Refresh logs"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                )}
            </div>

            {/* ─── Search + Filter Toggle ─────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email, request, IP address..."
                        className="pl-9 bg-card border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-muted transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>
                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="default"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 shrink-0"
                >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-1.5 text-muted-foreground hover:text-destructive shrink-0"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* ─── Filters Panel ──────────────────────────────── */}
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Action Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Activity className="h-3 w-3" />
                            Action Type
                        </label>
                        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === "__all__" ? "" : v); setPage(1); }}>
                            <SelectTrigger size="sm" className="w-full bg-background">
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Actions</SelectItem>
                                {AUDIT_ACTIONS.map((a) => (
                                    <SelectItem key={a} value={a}>
                                        <span className="flex items-center gap-2">
                                            {(() => { const Ic = ACTION_CONFIG[a]?.icon || Activity; return <Ic className="h-3 w-3" />; })()}
                                            {ACTION_LABELS[a] || a}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Entity Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Shield className="h-3 w-3" />
                            Entity Type
                        </label>
                        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v === "__all__" ? "" : v); setPage(1); }}>
                            <SelectTrigger size="sm" className="w-full bg-background">
                                <SelectValue placeholder="All Entities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Entities</SelectItem>
                                {entityTypes.map((e) => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Activity className="h-3 w-3" />
                            Status
                        </label>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "__all__" ? "" : v); setPage(1); }}>
                            <SelectTrigger size="sm" className="w-full bg-background">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Status</SelectItem>
                                <SelectItem value="success">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Success
                                    </span>
                                </SelectItem>
                                <SelectItem value="failed">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                        Failed
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            From Date
                        </label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                            className="bg-background h-8 text-sm"
                        />
                    </div>

                    {/* Date To */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            To Date
                        </label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                            className="bg-background h-8 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* ─── Table ──────────────────────────────────────── */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[170px] font-semibold">Timestamp</TableHead>
                                <TableHead className="w-[200px] font-semibold">User</TableHead>
                                <TableHead className="w-[160px] font-semibold">Action</TableHead>
                                <TableHead className="w-[140px] font-semibold">Entity</TableHead>
                                <TableHead className="w-[85px] text-center font-semibold">Status</TableHead>
                                <TableHead className="w-[90px] text-right font-semibold">Duration</TableHead>
                                <TableHead className="w-[60px] text-center font-semibold">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : !data || data.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-60">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                                            <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                                                <AlertCircle className="h-10 w-10 opacity-40" />
                                            </div>
                                            <p className="font-semibold text-base">No audit logs found</p>
                                            <p className="text-sm mt-1 max-w-sm text-center">No records match the current filters. Try adjusting your search criteria.</p>
                                            {activeFilterCount > 0 && (
                                                <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={clearAllFilters}>
                                                    <X className="h-3.5 w-3.5" />
                                                    Clear all filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        className="group cursor-pointer transition-colors hover:bg-muted/40"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        {/* Timestamp */}
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 opacity-50 shrink-0" />
                                                <span>{format(new Date(log.timestamp), "MMM d, HH:mm:ss")}</span>
                                            </div>
                                        </TableCell>

                                        {/* User */}
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/15 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">
                                                        {(log.userEmail || "S")[0]}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium truncate">{log.userEmail || "System"}</div>
                                                    {log.ipAddress && (
                                                        <div className="text-[11px] text-muted-foreground font-mono truncate">{log.ipAddress}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell>
                                            <ActionBadge action={log.action} />
                                        </TableCell>

                                        {/* Entity */}
                                        <TableCell>
                                            <div className="text-sm font-medium">{log.entityType || "-"}</div>
                                            {log.entityId && (
                                                <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]" title={log.entityId}>
                                                    {log.entityId.substring(0, 8)}...
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="text-center">
                                            <StatusIndicator isSuccess={log.isSuccess} />
                                        </TableCell>

                                        {/* Duration */}
                                        <TableCell className="text-right">
                                            <span className={`font-mono text-xs font-semibold ${getDurationColor(log.durationMs)}`}>
                                                {formatDuration(log.durationMs)}
                                            </span>
                                        </TableCell>

                                        {/* Details */}
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ─── Pagination Footer ──────────────────────── */}
                {data && data.totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/20">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                                Showing {from}-{to} of {data.totalCount.toLocaleString()}
                            </span>
                            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                                <SelectTrigger size="sm" className="w-auto h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((s) => (
                                        <SelectItem key={s} value={s.toString()}>{s} per page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="h-8 gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>
                            <span className="text-sm font-medium px-2 min-w-[100px] text-center">
                                Page {page} of {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= data.totalPages}
                                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                                className="h-8 gap-1"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Detail Modal ───────────────────────────────── */}
            <DetailDialog
                log={selectedLog}
                open={!!selectedLog}
                onOpenChange={(open) => { if (!open) setSelectedLog(null); }}
            />
        </div>
    );
}
