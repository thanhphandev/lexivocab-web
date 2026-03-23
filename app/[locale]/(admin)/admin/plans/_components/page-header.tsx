import { Button } from "@/components/ui/button";
import { Plus, Box } from "lucide-react";

interface PageHeaderProps {
  onCreateClick: () => void;
}

export function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 shadow-sm">
          <Box className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Definitions</h1>
          <p className="text-muted-foreground mt-0.5">
            Manage subscription packages, pricing tiers, and bundled features
          </p>
        </div>
      </div>

      <Button onClick={onCreateClick} className="shadow-sm gap-2">
        <Plus className="h-4 w-4" /> Add Plan
      </Button>
    </div>
  );
}
