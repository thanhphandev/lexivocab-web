import { useState } from "react";
import type { MasterVocabularyDto } from "@/lib/api/types";

export interface VocabularyFormData {
  wordText: string;
  meaning: string;
  phoneticUk: string;
  phoneticUs: string;
  audioUrl: string;
  cefrLevel: string;
}

export function useVocabularyForm() {
  const [editingVocab, setEditingVocab] = useState<MasterVocabularyDto | null>(null);
  const [formData, setFormData] = useState<VocabularyFormData>({
    wordText: "",
    meaning: "",
    phoneticUk: "",
    phoneticUs: "",
    audioUrl: "",
    cefrLevel: "",
  });

  const resetForm = () => {
    setEditingVocab(null);
    setFormData({
      wordText: "",
      meaning: "",
      phoneticUk: "",
      phoneticUs: "",
      audioUrl: "",
      cefrLevel: "",
    });
  };

  const loadVocab = (vocab: MasterVocabularyDto) => {
    setEditingVocab(vocab);
    setFormData({
      wordText: vocab.word,
      meaning: vocab.meaning || "",
      phoneticUk: vocab.phoneticUk || "",
      phoneticUs: vocab.phoneticUs || "",
      audioUrl: vocab.audioUrl || "",
      cefrLevel: vocab.cefrLevel || "",
    });
  };

  const updateField = <K extends keyof VocabularyFormData>(
    field: K,
    value: VocabularyFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    editingVocab,
    formData,
    resetForm,
    loadVocab,
    updateField,
  };
}
