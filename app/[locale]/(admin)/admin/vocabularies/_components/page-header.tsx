import { BookOpen, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
}

export function PageHeader({
  search,
  onSearchChange,
  onAddClick,
  onFileUpload,
  isImporting,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master Vocabularies</h2>
          <p className="text-muted-foreground mt-0.5">
            Global seed list of words verified by the platform.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search word..."
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileUpload}
            disabled={isImporting}
          />
          <Button
            variant="secondary"
            className="shrink-0 group-hover/btn:bg-accent"
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="mr-2 h-4 w-4" />
            )}
            Import CSV
          </Button>
        </div>
        <Button onClick={onAddClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </div>
    </div>
  );
}
