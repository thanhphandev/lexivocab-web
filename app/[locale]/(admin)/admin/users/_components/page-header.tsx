import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function PageHeader({ search, onSearchChange }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Search, filter, and view user details.
            </p>
          </div>
        </div>
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          className="pl-9 bg-card border-muted-foreground/20"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
