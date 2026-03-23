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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { FeatureFormData } from "../_hooks/use-feature-form";

interface FeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: FeatureFormData;
  onFieldChange: <K extends keyof FeatureFormData>(field: K, value: FeatureFormData[K]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function FeatureDialog({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFieldChange,
  onSave,
  isSaving,
}: FeatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? `Edit Feature: ${formData.code}` : "Create New Feature"}
          </DialogTitle>
          <DialogDescription>
            Define a system capability that can be toggled or metered across the platform
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">
              Feature Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g. MAX_WORDS, AI_ACCESS"
              value={formData.code}
              onChange={(e) => onFieldChange("code", e.target.value.toUpperCase())}
              disabled={isEditing}
              className="font-mono"
            />
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Unique identifier used in code. Cannot be changed later
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              placeholder="e.g. Maximum vocabulary words allowed"
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Value Type</Label>
              <Select
                value={formData.valueType}
                onValueChange={(value) => onFieldChange("valueType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean (Toggle)</SelectItem>
                  <SelectItem value="integer">Integer (Quota)</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default">Default Value</Label>
              <Input
                id="default"
                placeholder={formData.valueType === "boolean" ? "false" : "0"}
                value={formData.defaultValue}
                onChange={(e) => onFieldChange("defaultValue", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving || !formData.code}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Feature" : "Create Feature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
