"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
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

const getNumericQuality = (qualityRaw: string | number): number => {
    if (typeof qualityRaw === 'number') return qualityRaw;
    switch (String(qualityRaw).toLowerCase()) {
        case "perfect": return 5;
        case "good": return 4;
        case "hard": return 3;
        case "barelyrecalled": return 2;
        case "wrong": return 1;
        case "blackout": return 0;
        default: return 0;
    }
};

const getQualityColor = (qualityRaw: string | number) => {
    const quality = getNumericQuality(qualityRaw);
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

export function ReviewHistoryTable() {
    const t = useTranslations("Dashboard.reviewHistory");
    const [data, setData] = useState<PagedResult<ReviewHistoryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await clientApi.get<PagedResult<ReviewHistoryDto>>(`/api/proxy/reviews/history?page=${page}&pageSize=10`);
            if (res.success) setData(res.data);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const getQualityLabel = (qualityRaw: string | number) => {
        const num = getNumericQuality(qualityRaw);
        const key = String(num) as "0" | "1" | "2" | "3" | "4" | "5";
        return t(`quality.${key}`);
    };

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col mt-8">
            <div className="p-6 pb-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>

            <div className="relative w-full overflow-auto mt-4 border-t">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[30%]">{t("colWord")}</TableHead>
                            <TableHead className="w-[30%]">{t("colQuality")}</TableHead>
                            <TableHead className="w-[20%]">{t("colTime")}</TableHead>
                            <TableHead className="w-[20%] text-right pr-6">{t("colDate")}</TableHead>
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
                                    {t("empty")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-semibold pl-4">
                                        <span className="text-base">{item.wordText}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getQualityColor(item.qualityScore)}`}>
                                            {getQualityLabel(item.qualityScore)} ({getNumericQuality(item.qualityScore)})
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

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                    <span className="text-sm text-muted-foreground font-medium">
                        {t("showing", {
                            from: (data.page - 1) * data.pageSize + 1,
                            to: Math.min(data.page * data.pageSize, data.totalCount),
                            total: data.totalCount
                        })}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            {t("previous")}
                        </Button>
                        <Button variant="outline" size="sm"
                            disabled={page >= data.totalPages || isLoading}
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                        >
                            {t("next")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
