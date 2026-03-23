import { Button } from "@/components/ui/button";
import { Plus, Ticket } from "lucide-react";

interface PageHeaderProps {
  onCreateClick: () => void;
}

export function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
          <Ticket className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground mt-0.5">
            Create and manage promotional discount codes for marketing campaigns
          </p>
        </div>
      </div>

      <Button onClick={onCreateClick} className="gap-2 shadow-sm">
        <Plus className="h-4 w-4" /> Create Coupon
      </Button>
    </div>
  );
}
