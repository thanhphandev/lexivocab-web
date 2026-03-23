import { useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { toast } from "sonner";
import type {
  CreateMasterVocabularyRequest,
  UpdateMasterVocabularyRequest,
  MasterVocabularyDto,
} from "@/lib/api/types";
import type { VocabularyFormData } from "./use-vocabulary-form";

export function useVocabularyActions(onSuccess: () => void) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleSave = async (
    editingVocab: MasterVocabularyDto | null,
    formData: VocabularyFormData
  ) => {
    if (!formData.wordText || !formData.meaning) {
      toast.error("Word Text and Meaning are required");
      return false;
    }

    setIsSaving(true);
    try {
      if (editingVocab) {
        const req: UpdateMasterVocabularyRequest = {
          meaning: formData.meaning || undefined,
          phoneticUk: formData.phoneticUk || undefined,
          phoneticUs: formData.phoneticUs || undefined,
          audioUrl: formData.audioUrl || undefined,
          cefrLevel: formData.cefrLevel || undefined,
        };
        const res = await adminApi.updateMasterVocabulary(editingVocab.id, req);
        if (res.success) {
          toast.success("Word updated successfully");
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to update word");
        }
      } else {
        const req: CreateMasterVocabularyRequest = {
          word: formData.wordText,
          meaning: formData.meaning,
          phoneticUk: formData.phoneticUk,
          phoneticUs: formData.phoneticUs,
          audioUrl: formData.audioUrl,
          cefrLevel: formData.cefrLevel,
        };
        const res = await adminApi.createMasterVocabulary(req);
        if (res.success) {
          toast.success("New word added to master dictionary");
          onSuccess();
          return true;
        } else {
          toast.error(res.error || "Failed to create word");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  const handleAutoFill = async (
    wordText: string,
    currentFormData: VocabularyFormData,
    updateField: (field: keyof VocabularyFormData, value: string) => void
  ) => {
    if (!wordText) {
      toast.error("Please enter a word first.");
      return;
    }
    setIsAutoFilling(true);
    try {
      const res = await adminApi.lookupMasterVocabulary(wordText);
      if (!res.success) {
        toast.error(res.error || "Word not found in dictionary.");
        return;
      }
      if (res.data) {
        updateField("meaning", res.data.meaning || currentFormData.meaning);
        updateField("phoneticUk", res.data.phoneticUk || currentFormData.phoneticUk);
        updateField("phoneticUs", res.data.phoneticUs || currentFormData.phoneticUs);
        toast.success("Definition auto-filled from internet!");
      }
    } catch (e) {
      toast.error("Failed to fetch word definition.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleDelete = async (id: string, word: string) => {
    try {
      const res = await adminApi.deleteMasterVocabulary(id);
      if (res.success) {
        toast.success(`'${word}' deleted from global dictionary`);
        onSuccess();
      } else {
        toast.error(res.error || "Failed to delete word");
      }
    } catch (error) {
      toast.error("Failed to delete word");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await adminApi.approveMasterVocabulary(id);
      if (res.success) {
        toast.success("Word approved successfully");
        onSuccess();
      } else {
        toast.error(res.error || "Failed to approve word");
      }
    } catch (error) {
      toast.error("Failed to approve word");
    }
  };

  return {
    isSaving,
    isAutoFilling,
    handleSave,
    handleAutoFill,
    handleDelete,
    handleApprove,
  };
}
