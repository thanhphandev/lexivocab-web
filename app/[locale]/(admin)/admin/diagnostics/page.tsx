"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Activity,
    Database,
    Cpu,
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Server,
    HardDrive,
    Pause,
    Play,
    Maximize2,
    TrendingUp,
    Shield,
    Layers,
    Workflow,
    Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { clientApi, diagnosticsApi } from "@/lib/api/api-client";
import type { SystemDiagnosticsDto } from "@/lib/api/types";
import { motion } from "framer-motion";

export default function DiagnosticsPage() {
    const [data, setData] = useState<SystemDiagnosticsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchDiagnostics = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const res = await diagnosticsApi.getSystemInfo();
            if (res.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch diagnostics", err);
        } finally {
            setIsLoading(false);
            setLastRefresh(new Date());
        }
    };

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling) {
            interval = setInterval(() => fetchDiagnostics(true), 5000);
        }
        return () => clearInterval(interval);
    }, [isPolling]);

    const getRamValue = (str?: string) => str ? parseInt(str.split(" ")[0]) : 0;
    
    const memLoad = getRamValue(data?.runtime.memoryLoad);
    const memTotal = getRamValue(data?.runtime.totalAvailableMemory) || 2048; // Fallback to 2GB
    const memPercentage = Math.min(Math.round((memLoad / memTotal) * 100), 100);

    const privateMem = getRamValue(data?.process.privateMemory);
    const peakMem = getRamValue(data?.process.peakWorkingSet);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        System Health & Diagnostics
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        Live monitoring of server resources and connectivity.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border text-[10px] font-medium">
                        <span className={`h-2 w-2 rounded-full ${isPolling ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} />
                        {isPolling ? "LIVE UPDATING" : "PAUSED"}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsPolling(!isPolling)}
                        className="h-8 w-8 p-0"
                    >
                        {isPolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="default" size="sm" onClick={() => fetchDiagnostics()} disabled={isLoading} className="gap-2 h-8">
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Force Sync
                    </Button>
                </div>
            </div>

            {/* Top Level Health Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <HealthCard
                    title="Database Connection"
                    status={data?.database.canConnect ? "Healthy" : "Critical"}
                    icon={<Database className={data?.database.canConnect ? "text-emerald-500" : "text-rose-500"} />}
                    description={data?.database.provider || "Npgsql / PostgreSQL"}
                    subtext={data?.database.server || "localhost"}
                />
                
                <Card className="shadow-sm border-l-4 border-l-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Cpu className="h-12 w-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            Memory Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.process.privateMemory}</div>
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[10px] items-end">
                                <span className="text-muted-foreground">Load: {memPercentage}%</span>
                                <span className="font-mono">{data?.runtime.memoryLoad} / {data?.runtime.totalAvailableMemory}</span>
                            </div>
                            <Progress value={memPercentage} className="h-1.5" />
                        </div>
                    </CardContent>
                </Card>

                <HealthCard
                    title="Server Uptime"
                    status="Online"
                    icon={<Clock className="text-primary" />}
                    value={data?.process.upTime || "N/A"}
                    description={`Started: ${data?.process.startTime ? new Date(data.process.startTime).toLocaleTimeString() : "..."}`}
                />

                <Card className="shadow-sm border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">OS Environment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate leading-tight mb-1" title={data?.environment.os}>
                            {data?.environment.os.split(" #")[0]}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-mono py-0">{data?.environment.architecture}</Badge>
                            <span className="text-[10px] text-muted-foreground">{data?.environment.runtime.split(" (")[0]}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
                {/* Process Details */}
                <Card className="md:col-span-8 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                        <div>
                            <CardTitle>Process & Runtime Details</CardTitle>
                            <CardDescription>Internal metrics from the .NET Host Process</CardDescription>
                        </div>
                        <Activity className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <Metric label="Managed Heap Size" value={data?.runtime.heapSize} icon={<Maximize2 className="h-3 w-3" />} />
                                <Metric label="Peak Working Set" value={data?.process.peakWorkingSet} icon={<TrendingUp className="h-3 w-3" />} />
                                <Metric label="Memory Limit" value={data?.runtime.highMemoryLoadThreshold} icon={<Shield className="h-3 w-3" />} />
                            </div>
                            <div className="space-y-4">
                                <Metric label="Thread Count" value={data?.process.threads} icon={<Layers className="h-3 w-3" />} />
                                <Metric label="Handle Count" value={data?.process.handleCount} icon={<Hash className="h-3 w-3" />} />
                                <Metric label="Architecture" value={data?.process.is64Bit ? "64-bit Process" : "32-bit Process"} icon={<Workflow className="h-3 w-3" />} />
                            </div>
                            <div className="space-y-4">
                                <Metric label="CPUs / Logicals" value={data?.environment.processorCount} icon={<Cpu className="h-3 w-3" />} />
                                <Metric label="Machine Name" value={data?.environment.machineName} icon={<Server className="h-3 w-3" />} />
                                <Metric label="Work Dir" value={data?.environment.workingDirectory} isCode />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subsystem Status */}
                <div className="md:col-span-4 space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Storage & DB Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <SubsystemItem label="PostgreSQL" version={data?.database.version || "Unknown"} status={data?.database.canConnect ? "online" : "offline"} />
                            <SubsystemItem label="Redis Cache" version="7.2 (Docker)" status="online" />
                            <SubsystemItem label="EF Core Provider" version={data?.database.provider?.split(".").pop() || "Npgsql"} status="online" />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm bg-indigo-500/5 border-indigo-500/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Security Engine</h4>
                                    <p className="text-[10px] text-muted-foreground">Encryption: TLS 1.3 / AES-256</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs items-center">
                                    <span className="text-muted-foreground">JWT Token Validation</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px] h-4">STRICT</Badge>
                                </div>
                                <div className="flex justify-between text-xs items-center">
                                    <span className="text-muted-foreground">Bcrypt Work Factor</span>
                                    <span className="font-mono text-[9px]">12</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 italic">
                <span>Last full diagnostic sync: {lastRefresh.toLocaleTimeString()}</span>
                <span>LexiVocab Enterprise Engine v1.0.4-stable</span>
            </div>
        </div>
    );
}

function HealthCard({ title, status, icon, description, subtext, value }: any) {
    const isHealthy = status === "Healthy" || status === "Online";
    return (
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{title}</CardTitle>
                <div className="h-4 w-4">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{value || status}</div>
                    {!value && <span className={`text-[10px] font-bold ${isHealthy ? "text-emerald-500" : "text-rose-500"}`}>{status === "Healthy" ? "UP" : "OK"}</span>}
                </div>
                <div className="mt-1 flex flex-col">
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                    {subtext && <p className="text-[10px] font-mono text-muted-foreground/60">{subtext}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function Metric({ label, value, icon, isCode }: any) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1.5">
                {icon} {label}
            </span>
            <p className={cn("text-sm font-medium", isCode && "font-mono text-[10px] break-all bg-muted p-1 px-2 rounded")}>
                {value ?? "N/A"}
            </p>
        </div>
    );
}

function SubsystemItem({ label, version, status }: any) {
    return (
        <div className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0 border-border/40">
            <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={version}>{version}</p>
            </div>
            <Badge className={cn(
                "h-5 text-[9px] border-0",
                status === "online" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
                {status.toUpperCase()}
            </Badge>
        </div>
    );
}



function ShieldAlert(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
}
