import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CouponFormData } from "../_hooks/use-coupon-form";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: CouponFormData;
  onFieldChange: <K extends keyof CouponFormData>(field: K, value: CouponFormData[K]) => void;
  onSave: () => void;
}

export function CouponDialog({
  open,
  onOpenChange,
  editingId,
  formData,
  onFieldChange,
  onSave,
}: CouponDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={editingId || "new"} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingId ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
          <DialogDescription>
            Set up discount codes to incentivize upgrades and reward customers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">
              Coupon Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => onFieldChange("code", e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER2026"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Use uppercase letters and numbers only
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => onFieldChange("discountType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Percentage (%)</SelectItem>
                  <SelectItem value="1">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discountValue">
                Discount Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => onFieldChange("discountValue", e.target.value)}
                placeholder={formData.discountType === "0" ? "e.g. 20" : "e.g. 50000"}
                min="0"
              />
            </div>
          </div>

          {formData.discountType === "1" && (
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => onFieldChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="maxUses">Maximum Uses (Optional)</Label>
            <Input
              id="maxUses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => onFieldChange("maxUses", e.target.value)}
              placeholder="Leave blank for unlimited"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Limit how many times this coupon can be redeemed
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="active" className="text-base">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this coupon for immediate use
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => onFieldChange("isActive", checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>{editingId ? "Update Coupon" : "Create Coupon"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
