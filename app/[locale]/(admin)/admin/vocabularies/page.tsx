"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "./_components/page-header";
import { VocabularyTable } from "./_components/vocabulary-table";
import { VocabularyDialog } from "./_components/vocabulary-dialog";
import { useVocabulariesData } from "./_hooks/use-vocabularies-data";
import { useVocabularyForm } from "./_hooks/use-vocabulary-form";
import { useVocabularyActions } from "./_hooks/use-vocabulary-actions";
import { useCsvImport } from "./_hooks/use-csv-import";
import type { MasterVocabularyDto } from "@/lib/api/types";

export default function AdminVocabulariesPage() {
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ id: string; word: string } | null>(
    null
  );

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, activeTab]);

  const isApproved = activeTab === "approved";
  const { vocabularies, loading, totalPages, refetch } = useVocabulariesData(
    page,
    debouncedSearch,
    isApproved
  );

  const vocabForm = useVocabularyForm();
  const { isSaving, isAutoFilling, handleSave, handleAutoFill, handleDelete, handleApprove } =
    useVocabularyActions(refetch);
  const { isImporting, handleFileUpload } = useCsvImport(refetch);

  const handleOpenDialog = (vocab?: MasterVocabularyDto) => {
    if (vocab) {
      vocabForm.loadVocab(vocab);
    } else {
      vocabForm.resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveClick = async () => {
    const success = await handleSave(vocabForm.editingVocab, vocabForm.formData);
    if (success) {
      setIsDialogOpen(false);
      vocabForm.resetForm();
    }
  };

  const handleAutoFillClick = () => {
    handleAutoFill(vocabForm.formData.wordText, vocabForm.formData, vocabForm.updateField);
  };

  const handleDeleteClick = async () => {
    if (!deleteConfig) return;
    await handleDelete(deleteConfig.id, deleteConfig.word);
    setDeleteConfig(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        search={search}
        onSearchChange={setSearch}
        onAddClick={() => handleOpenDialog()}
        onFileUpload={handleFileUpload}
        isImporting={isImporting}
      />

      <Tabs
        defaultValue="approved"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="approved">Approved List</TabsTrigger>
          <TabsTrigger value="pending">Community Pending</TabsTrigger>
        </TabsList>

        <VocabularyTable
          vocabularies={vocabularies}
          loading={loading}
          activeTab={activeTab}
          onEdit={handleOpenDialog}
          onDelete={(id, word) => setDeleteConfig({ id, word })}
          onApprove={handleApprove}
          onAddClick={() => handleOpenDialog()}
        />
      </Tabs>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <VocabularyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={!!vocabForm.editingVocab}
        formData={vocabForm.formData}
        onFieldChange={vocabForm.updateField}
        onSave={handleSaveClick}
        onAutoFill={handleAutoFillClick}
        isSaving={isSaving}
        isAutoFilling={isAutoFilling}
      />

      <ConfirmDialog
        open={!!deleteConfig}
        onOpenChange={(open) => !open && setDeleteConfig(null)}
        title="Delete Global Word"
        description={`Are you sure you want to completely delete '${deleteConfig?.word}' from global dictionary? Customers will lose access to this verified term.`}
        onConfirm={handleDeleteClick}
        confirmText="Delete Word"
        variant="destructive"
      />
    </div>
  );
}
