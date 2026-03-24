import { useState } from "react";
import { format } from "date-fns";
import { Activity, Check, Copy } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuditLogDto } from "@/lib/api/types";
import { ACTION_CONFIG, ActionCategory, ACTION_LABELS } from "./constants";
import { formatDuration, getDurationColor, tryFormatJson } from "./helpers";

export function ActionBadge({ action }: { action: string }) {
    const config = ACTION_CONFIG[action] || {
        category: "system" as ActionCategory,
        icon: Activity,
        color: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
    };
    const Icon = config.icon;
    const label = ACTION_LABELS[action] || action;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${config.color}`}>
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[120px]">{label}</span>
        </span>
    );
}

export function StatusIndicator({ isSuccess }: { isSuccess: boolean }) {
    return isSuccess ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Success
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Failed
        </span>
    );
}

export function SkeletonRow() {
    return (
        <TableRow className="animate-pulse">
            <TableCell><div className="h-4 w-32 bg-muted rounded-md" /></TableCell>
            <TableCell><div className="space-y-1.5"><div className="h-4 w-36 bg-muted rounded-md" /><div className="h-3 w-24 bg-muted rounded-md" /></div></TableCell>
            <TableCell><div className="h-6 w-28 bg-muted rounded-full" /></TableCell>
            <TableCell><div className="space-y-1.5"><div className="h-4 w-24 bg-muted rounded-md" /><div className="h-3 w-20 bg-muted rounded-md" /></div></TableCell>
            <TableCell><div className="h-4 w-16 bg-muted rounded-md" /></TableCell>
            <TableCell><div className="h-4 w-14 bg-muted rounded-md" /></TableCell>
            <TableCell><div className="h-7 w-7 bg-muted rounded-md" /></TableCell>
        </TableRow>
    );
}

export function DetailDialog({
    log,
    open,
    onOpenChange,
}: {
    log: AuditLogDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!log) return null;

    const config = ACTION_CONFIG[log.action];
    const Icon = config?.icon || Activity;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config?.color || "bg-gray-500/15"}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-lg">Log Details</div>
                            <div className="text-sm font-normal text-muted-foreground mt-0.5">
                                {log.id.substring(0, 8)}...
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* General Info */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            General Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard label="Timestamp" value={format(new Date(log.timestamp), "PPpp")} />
                            <InfoCard label="Action">
                                <ActionBadge action={log.action} />
                            </InfoCard>
                            <InfoCard label="Status">
                                <StatusIndicator isSuccess={log.isSuccess} />
                            </InfoCard>
                            <InfoCard label="Duration">
                                <span className={`font-mono text-sm font-semibold ${getDurationColor(log.durationMs)}`}>
                                    {formatDuration(log.durationMs)}
                                </span>
                            </InfoCard>
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            User Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard label="Email" value={log.userEmail || "System"} />
                            <InfoCard label="User ID">
                                <CopyableValue
                                    value={log.userId || "-"}
                                    field="userId"
                                    copiedField={copiedField}
                                    onCopy={handleCopy}
                                />
                            </InfoCard>
                        </div>
                    </div>

                    {/* Entity Info */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Entity Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard label="Entity Type" value={log.entityType || "-"} />
                            <InfoCard label="Entity ID">
                                <CopyableValue
                                    value={log.entityId || "-"}
                                    field="entityId"
                                    copiedField={copiedField}
                                    onCopy={handleCopy}
                                />
                            </InfoCard>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Technical Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard label="Request Name" value={log.requestName || "-"} />
                            <InfoCard label="Trace ID">
                                <CopyableValue
                                    value={log.traceId || "-"}
                                    field="traceId"
                                    copiedField={copiedField}
                                    onCopy={handleCopy}
                                />
                            </InfoCard>
                            <InfoCard label="IP Address" value={log.ipAddress || "-"} />
                            <InfoCard
                                label="User Agent"
                                value={log.userAgent ? (log.userAgent.length > 60 ? log.userAgent.substring(0, 60) + "..." : log.userAgent) : "-"}
                                className="col-span-1"
                            />
                        </div>
                    </div>

                    {/* Data Payload */}
                    {(log.oldValues || log.newValues) && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Data Payload
                            </h4>
                            <div className={`grid gap-3 ${log.oldValues && log.newValues ? "grid-cols-2" : "grid-cols-1"}`}>
                                {log.oldValues && (
                                    <div className="space-y-1.5">
                                        <div className="text-[11px] font-medium text-red-500/80 uppercase tracking-wider">Old Values</div>
                                        <pre className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs font-mono overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all max-h-48 scrollbar-thin">
                                            {tryFormatJson(log.oldValues)}
                                        </pre>
                                    </div>
                                )}
                                {log.newValues && (
                                    <div className="space-y-1.5">
                                        <div className="text-[11px] font-medium text-emerald-500/80 uppercase tracking-wider">New Values</div>
                                        <pre className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs font-mono overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all max-h-48 scrollbar-thin">
                                            {tryFormatJson(log.newValues)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    {log.additionalInfo && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Additional Information
                            </h4>
                            <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-48 scrollbar-thin">
                                {tryFormatJson(log.additionalInfo)}
                            </pre>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function InfoCard({ label, value, children, className = "" }: { label: string; value?: string; children?: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-muted/30 border rounded-lg p-3 ${className}`}>
            <div className="text-[11px] font-medium text-muted-foreground mb-1">{label}</div>
            {children || <div className="text-sm font-medium truncate" title={value}>{value}</div>}
        </div>
    );
}

export function CopyableValue({ value, field, copiedField, onCopy }: { value: string; field: string; copiedField: string | null; onCopy: (text: string, field: string) => void }) {
    if (value === "-") return <span className="text-sm text-muted-foreground">-</span>;
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-sm font-mono truncate">{value}</span>
            <button
                onClick={() => onCopy(value, field)}
                className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                title="Copy to clipboard"
            >
                {copiedField === field ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                )}
            </button>
        </div>
    );
}
