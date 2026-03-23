import { useState } from "react";
import { adminApi } from "@/lib/api/api-client";
import { toast } from "sonner";
import Papa from "papaparse";

export function useCsvImport(onSuccess: () => void) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const items = results.data
            .map((row: any) => ({
              word: row.Word || row.word,
              meaning: row.Meaning || row.meaning,
              phoneticUk: row.PhoneticUk || row.phoneticUk || null,
              phoneticUs: row.PhoneticUs || row.phoneticUs || null,
              cefrLevel: row.CefrLevel || row.cefrLevel || null,
              partOfSpeech: row.PartOfSpeech || row.partOfSpeech || null,
            }))
            .filter((item) => !!item.word);

          if (items.length === 0) {
            toast.error("No valid headers found. Please use CSV with headers: word, meaning");
            return;
          }

          toast.loading(`Importing ${items.length} words...`);
          const res = await adminApi.createMasterVocabularyBatch({ items });
          toast.dismiss();

          if (res.success) {
            toast.success(`Successfully imported ${res.data?.createdCount || 0} words.`);
            onSuccess();
          } else {
            toast.error(res.error || "Failed to import vocabulary.");
          }
        } catch (err) {
          toast.error("An error occurred during import.");
        } finally {
          setIsImporting(false);
          e.target.value = ""; // reset input
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file: " + error.message);
        setIsImporting(false);
        e.target.value = "";
      },
    });
  };

  return { isImporting, handleFileUpload };
}
