import { useState } from "react";
import { toast } from "sonner";
import { vocabularyApi } from "@/lib/api/api-client";
import { showErrorToast } from "@/lib/error-handler";
import type { MasterVocabularyDto } from "@/lib/api/types";

export function useWordActions(tErrors: (key: string) => string) {
  const [isSaving, setIsSaving] = useState(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  const handleAddToVocab = async (word: MasterVocabularyDto, successMessage: string) => {
    setIsSaving(true);
    const res = await vocabularyApi.create({
      wordText: word.word,
      customMeaning: word.meaning || undefined,
    });
    if (res.success) {
      toast.success(`${successMessage}: "${word.word}"`);
    } else {
      showErrorToast(res, tErrors("GENERIC_ERROR"), tErrors);
    }
    setIsSaving(false);
  };

  const playAudio = (url: string) => {
    if (!url) return;
    setPlayingAudioUrl(url);
    const audio = new Audio(url);

    audio.addEventListener("ended", () => setPlayingAudioUrl(null));
    audio.play().catch((e) => {
      console.error("Audio play failed", e);
      toast.error(tErrors("GENERIC_ERROR") || "Failed to play audio");
      setPlayingAudioUrl(null);
    });
  };

  return { isSaving, playingAudioUrl, handleAddToVocab, playAudio };
}
