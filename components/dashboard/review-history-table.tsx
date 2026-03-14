"use client";

import { useEffect, useState, useCallback } from "react";
import { clientApi } from "@/lib/api/api-client";
import type { ReviewHistoryDto, PagedResult } from "@/lib/api/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const getQualityColor = (quality: number) => {
    switch (quality) {
        case 5: return "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20";
        case 4: return "text-green-600 bg-green-500/10 border border-green-500/20";
        case 3: return "text-yellow-600 bg-yellow-500/10 border border-yellow-500/20";
        case 2: return "text-orange-600 bg-orange-500/10 border border-orange-500/20";
        case 1: return "text-red-500 bg-red-400/10 border border-red-400/20";
        case 0: return "text-rose-600 bg-rose-600/10 border border-rose-600/20";
        default: return "text-muted-foreground bg-muted border border-border";
    }
};

const getQualityLabel = (quality: number) => {
    switch (quality) {
        case 5: return "Perfect";
        case 4: return "Good";
        case 3: return "Hard";
        case 2: return "Struggled";
        case 1: return "Wrong";
        case 0: return "Blackout";
        default: return "Unknown";
    }
};

export function ReviewHistoryTable() {
    const [data, setData] = useState<PagedResult<ReviewHistoryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await clientApi.get<PagedResult<ReviewHistoryDto>>(`/api/proxy/reviews/history?page=${page}&pageSize=10`);
            if (res.success) {
                setData(res.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col mt-8">
            <div className="p-6 pb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Review History</h2>
                <p className="text-sm text-muted-foreground mt-1">Detailed log of your past flashcard interactions.</p>
            </div>

            <div className="relative w-full overflow-auto mt-4 border-t">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[30%]">Word</TableHead>
                            <TableHead className="w-[30%]">Quality / Outcome</TableHead>
                            <TableHead className="w-[20%]">Time Spent</TableHead>
                            <TableHead className="w-[20%] text-right pr-6">Reviewed On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                                    No review history found. Keep studying!
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-semibold pl-4">
                                        <div className="flex flex-col">
                                            <span className="text-base">{item.wordText}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getQualityColor(item.qualityScore)}`}>
                                            {getQualityLabel(item.qualityScore)} ({item.qualityScore})
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm font-medium">
                                        {item.timeSpentMs ? `${(item.timeSpentMs / 1000).toFixed(1)}s` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm pr-6">
                                        {format(new Date(item.reviewedAt), "MMM d, yyyy h:mm a")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                    <span className="text-sm text-muted-foreground font-medium">
                        Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(data.page * data.pageSize, data.totalCount)} of {data.totalCount}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= data.totalPages || isLoading}
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
