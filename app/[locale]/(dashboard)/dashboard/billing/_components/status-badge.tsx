"use client";

import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  Completed: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  Pending: {
    icon: <Clock className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  Failed: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  Refunded: {
    icon: <AlertCircle className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  Expired: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300",
  },
  Cancelled: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {status}
    </span>
  );
}
