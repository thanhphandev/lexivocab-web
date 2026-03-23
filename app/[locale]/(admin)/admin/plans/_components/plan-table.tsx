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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Box } from "lucide-react";
import type { PlanDefinitionDto } from "@/lib/api/types";

interface PlanTableProps {
  plans: PlanDefinitionDto[];
  loading: boolean;
  onEdit: (plan: PlanDefinitionDto) => void;
  onDelete: (id: string, name: string) => void;
}

export function PlanTable({ plans, loading, onEdit, onDelete }: PlanTableProps) {
  if (loading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>SaaS Plans</CardTitle>
          <CardDescription>Available subscription packages for users</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Pricing Tiers</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>SaaS Plans</CardTitle>
          <CardDescription>Available subscription packages for users</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Box className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium">No plans defined</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-[250px]">
              Get started by creating your first subscription tier for users
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>SaaS Plans</CardTitle>
        <CardDescription>Available subscription packages for users</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="font-semibold">Plan Name</TableHead>
                <TableHead className="font-semibold">Pricing Tiers</TableHead>
                <TableHead className="font-semibold">Features</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                        <Box className="h-3.5 w-3.5" />
                      </div>
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                      {p.pricings && p.pricings.length > 0 ? (
                        p.pricings.map((pricing: any) => (
                          <Badge
                            key={pricing.id}
                            variant="secondary"
                            className="font-mono text-[10px] bg-background border shadow-sm px-2 py-0.5 font-medium"
                          >
                            <span className="text-muted-foreground mr-1">
                              {pricing.billingCycle?.toUpperCase()}
                            </span>
                            <span className="text-primary">
                              {Number(pricing.price).toFixed(0)} {pricing.currency}
                            </span>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Pricing</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal border-dashed">
                      {Object.keys(p.features || {}).length} features bundled
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.isActive ? (
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(p.id, p.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
