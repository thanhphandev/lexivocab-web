import { Button } from "@/components/ui/button";
import { Plus, Key } from "lucide-react";

interface PageHeaderProps {
  onCreateClick: () => void;
}

export function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 shadow-sm">
          <Key className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Definitions</h1>
          <p className="text-muted-foreground mt-0.5">
            Manage granular system capabilities and quotas used in SaaS plans
          </p>
        </div>
      </div>

      <Button onClick={onCreateClick} className="shadow-sm gap-2">
        <Plus className="h-4 w-4" /> Add Feature
      </Button>
    </div>
  );
}
