import { toast } from "sonner";
import type { ExportFormat } from "../_types/vocabulary.schema";

interface UseVocabularyExportProps {
  t: (key: string, params?: Record<string, string>) => string;
  tErrors: (key: string) => string;
}

export function useVocabularyExport({ t, tErrors }: UseVocabularyExportProps) {
  const handleExport = async (format: ExportFormat) => {
    const loadingId = toast.loading(`${t("export")}...`);
    try {
      const res = await fetch(`/api/proxy/vocabularies/export?format=${format}`);
      if (!res.ok) {
        toast.error(t("exportFailed") || tErrors("VOCAB_EXPORT_FAILED"));
        toast.dismiss(loadingId);
        return;
      }

      toast.success(
        t("exportSuccess", { format: format.toUpperCase() }) ||
          `Exported ${format.toUpperCase()}`
      );

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const ext = format === "quizlet" ? "txt" : format;
      a.download = `lexivocab-export-${new Date().toISOString().split("T")[0]}.${ext}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.dismiss(loadingId);
    } catch (e) {
      console.error("Export failed", e);
      toast.error(t("exportFailed") || tErrors("VOCAB_EXPORT_FAILED"));
      toast.dismiss(loadingId);
    }
  };

  return { handleExport };
}
