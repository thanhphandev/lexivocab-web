import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, DollarSign } from "lucide-react";
import type { PlanFormData } from "../_hooks/use-plan-form";
import type { FeatureDefinitionDto, PlanPricingDto } from "@/lib/api/types";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: PlanFormData;
  allFeatures: FeatureDefinitionDto[];
  onFieldChange: <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => void;
  onAddPricing: () => void;
  onRemovePricing: (index: number) => void;
  onUpdatePricing: (index: number, key: keyof PlanPricingDto, value: any) => void;
  onUpdateFeature: (code: string, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PlanDialog({
  open,
  onOpenChange,
  isEditing,
  formData,
  allFeatures,
  onFieldChange,
  onAddPricing,
  onRemovePricing,
  onUpdatePricing,
  onUpdateFeature,
  onSave,
  isSaving,
}: PlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? `Edit Plan: ${formData.name}` : "Create New Plan"}
          </DialogTitle>
          <DialogDescription>
            Configure subscription tier with pricing options and feature bundles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">
                Plan Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Premium, Enterprise"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => onFieldChange("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                Active (visible to users)
              </Label>
            </div>
          </div>

          <Separator />

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Pricing Tiers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddPricing}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Pricing
              </Button>
            </div>

            {formData.pricings.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No pricing tiers defined. Add at least one pricing option.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.pricings.map((pricing, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Billing Cycle</Label>
                          <Input
                            placeholder="monthly"
                            value={pricing.billingCycle || ""}
                            onChange={(e) =>
                              onUpdatePricing(index, "billingCycle", e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            placeholder="99.00"
                            value={pricing.price || ""}
                            onChange={(e) =>
                              onUpdatePricing(index, "price", parseFloat(e.target.value) || 0)
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Currency</Label>
                          <Input
                            placeholder="USD"
                            value={pricing.currency || ""}
                            onChange={(e) =>
                              onUpdatePricing(index, "currency", e.target.value.toUpperCase())
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemovePricing(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Features Matrix */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Feature Configuration</h3>
            {allFeatures.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <p className="text-sm text-muted-foreground">
                  No features available. Create features first in the Features page.
                </p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {allFeatures.map((feature) => (
                  <Card key={feature.code} className="p-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {feature.code}
                          </code>
                          <Badge variant="outline" className="text-[10px]">
                            {feature.valueType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {feature.description || "No description"}
                        </p>
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder={feature.defaultValue || "value"}
                          value={formData.selectedFeatures[feature.code] || ""}
                          onChange={(e) => onUpdateFeature(feature.code, e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving || !formData.name}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
