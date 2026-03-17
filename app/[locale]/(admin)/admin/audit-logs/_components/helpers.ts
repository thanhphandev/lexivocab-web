export function formatDuration(ms: number): string {
    if (ms < 1) return "<1ms";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

export function getDurationColor(ms: number): string {
    if (ms < 100) return "text-emerald-600 dark:text-emerald-400";
    if (ms < 500) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

export function tryFormatJson(str: string): string {
    try {
        return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
        return str;
    }
}
