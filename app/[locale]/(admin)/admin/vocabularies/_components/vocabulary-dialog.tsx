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
import { Loader2, Search } from "lucide-react";
import type { VocabularyFormData } from "../_hooks/use-vocabulary-form";

interface VocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: VocabularyFormData;
  onFieldChange: <K extends keyof VocabularyFormData>(
    field: K,
    value: VocabularyFormData[K]
  ) => void;
  onSave: () => void;
  onAutoFill: () => void;
  isSaving: boolean;
  isAutoFilling: boolean;
}

export function VocabularyDialog({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFieldChange,
  onSave,
  onAutoFill,
  isSaving,
  isAutoFilling,
}: VocabularyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Master Word" : "Add Master Word"}
          </DialogTitle>
          <DialogDescription>
            Define a globally accessible dictionary item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="word">Word</Label>
              <div className="flex gap-2">
                <Input
                  id="word"
                  value={formData.wordText}
                  onChange={(e) => onFieldChange("wordText", e.target.value)}
                  disabled={isEditing}
                />
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="icon"
                    title="Auto-fill from Dictionary"
                    onClick={onAutoFill}
                    disabled={isAutoFilling}
                  >
                    {isAutoFilling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cefr">CEFR Level (e.g. A1, B2)</Label>
              <Input
                id="cefr"
                value={formData.cefrLevel}
                onChange={(e) =>
                  onFieldChange("cefrLevel", e.target.value.toUpperCase())
                }
                maxLength={2}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meaning">Meaning / Translation</Label>
            <Input
              id="meaning"
              value={formData.meaning}
              onChange={(e) => onFieldChange("meaning", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="uk">UK Phonetic</Label>
              <Input
                id="uk"
                value={formData.phoneticUk}
                onChange={(e) => onFieldChange("phoneticUk", e.target.value)}
                placeholder="/həˈləʊ/"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="us">US Phonetic</Label>
              <Input
                id="us"
                value={formData.phoneticUs}
                onChange={(e) => onFieldChange("phoneticUs", e.target.value)}
                placeholder="/həˈloʊ/"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="audio">Audio URL</Label>
            <Input
              id="audio"
              type="url"
              value={formData.audioUrl}
              onChange={(e) => onFieldChange("audioUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || !formData.wordText || !formData.meaning}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
