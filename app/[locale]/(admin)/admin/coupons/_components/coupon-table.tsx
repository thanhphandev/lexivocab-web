import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { AdminCouponDto } from "@/lib/api/types";

interface CouponTableProps {
  coupons: AdminCouponDto[];
  loading: boolean;
  onEdit: (coupon: AdminCouponDto) => void;
  onDelete: (id: string) => void;
}

export function CouponTable({ coupons, loading, onEdit, onDelete }: CouponTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getUsageColor = (current: number, max: number | null) => {
    if (!max) return "text-muted-foreground";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="w-[180px] font-semibold">Code</TableHead>
            <TableHead className="font-semibold">Discount</TableHead>
            <TableHead className="font-semibold">Usage</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-muted-foreground">Loading coupons...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-muted-foreground">No coupons found</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first coupon to get started
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => (
              <TableRow key={coupon.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-semibold text-sm bg-muted px-2 py-1 rounded">
                      {coupon.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyCode(coupon.code)}
                    >
                      {copiedCode === coupon.code ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {coupon.discountType === 0 ? (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      {coupon.discountValue}% OFF
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {coupon.currency === "VND" ? "₫" : "$"}
                      {coupon.discountValue.toLocaleString()} OFF
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${getUsageColor(coupon.currentUses, coupon.maxUses)}`}>
                    {coupon.currentUses}
                    <span className="text-muted-foreground font-normal">
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " (unlimited)"}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  {coupon.isActive ? (
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(coupon)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(coupon.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
