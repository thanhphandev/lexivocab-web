import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Key } from "lucide-react";
import type { FeatureDefinitionDto } from "@/lib/api/types";

interface FeatureTableProps {
  features: FeatureDefinitionDto[];
  loading: boolean;
  onEdit: (feature: FeatureDefinitionDto) => void;
  onDelete: (id: string, code: string) => void;
}

export function FeatureTable({ features, loading, onEdit, onDelete }: FeatureTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "boolean":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "integer":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "string":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="font-semibold">Feature Code</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Default Value</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : features.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-60">
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <Key className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-medium">No features defined</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    System capabilities allow you to control access levels across different plans
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            features.map((f) => (
              <TableRow key={f.id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                      <Key className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-primary">{f.code}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{f.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`uppercase text-[10px] ${getTypeColor(f.valueType)}`}>
                    {f.valueType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono border">
                    {f.defaultValue}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEdit(f)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(f.id, f.code)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
