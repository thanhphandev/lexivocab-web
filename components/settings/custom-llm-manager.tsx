import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

export interface CustomModel {
    id: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    model: string;
}

interface CustomLlmManagerProps {
    customLlmsJson: string;
    onChange: (json: string) => void;
}

export function CustomLlmManager({ customLlmsJson, onChange }: CustomLlmManagerProps) {
    const t = useTranslations("Dashboard.settings");
    const [models, setModels] = useState<CustomModel[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [formState, setFormState] = useState<CustomModel>({
        id: "", name: "", baseUrl: "", apiKey: "", model: ""
    });

    useEffect(() => {
        try {
            if (customLlmsJson && customLlmsJson !== "[]") {
                const parsed = JSON.parse(customLlmsJson);
                if (Array.isArray(parsed)) {
                    setModels(parsed);
                }
            } else {
                setModels([]);
            }
        } catch (e) {
            console.error("Failed to parse custom LLMs JSON", e);
        }
    }, [customLlmsJson]);

    const handleAdd = () => {
        setFormState({ id: crypto.randomUUID(), name: "", baseUrl: "", apiKey: "", model: "" });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleEdit = (model: CustomModel) => {
        setFormState({ ...model });
        setEditingId(model.id);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        setDeleteTargetId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            const newModels = models.filter(m => m.id !== deleteTargetId);
            setModels(newModels);
            onChange(JSON.stringify(newModels));
            setDeleteConfirmOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleSave = () => {
        if (!formState.name || !formState.baseUrl || !formState.apiKey || !formState.model) return;

        let newModels;
        if (editingId) {
            newModels = models.map(m => m.id === editingId ? formState : m);
        } else {
            newModels = [...models, formState];
        }

        setModels(newModels);
        onChange(JSON.stringify(newModels));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-500" />
                    {editingId ? t("customLlm.editTitle") : t("customLlm.addTitle")}
                </h4>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t("customLlm.displayName")}</label>
                        <Input
                            placeholder={t("customLlm.displayNamePlaceholder")}
                            value={formState.name}
                            onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t("customLlm.baseUrl")}</label>
                        <Input
                            placeholder={t("customLlm.baseUrlPlaceholder")}
                            value={formState.baseUrl}
                            onChange={e => setFormState(prev => ({ ...prev, baseUrl: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t("customLlm.apiKey")}</label>
                        <Input
                            placeholder={t("customLlm.apiKeyPlaceholder")}
                            type="password"
                            value={formState.apiKey}
                            onChange={e => setFormState(prev => ({ ...prev, apiKey: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t("customLlm.modelId")}</label>
                        <Input
                            placeholder={t("customLlm.modelIdPlaceholder")}
                            value={formState.model}
                            onChange={e => setFormState(prev => ({ ...prev, model: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>{t("customLlm.cancel")}</Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={!formState.name || !formState.baseUrl || !formState.apiKey || !formState.model}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {t("customLlm.save")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-4">
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold text-gray-700">{t("customLlm.title")}</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAdd}
                        className="h-8 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    >
                        <Plus className="w-4 h-4 mr-1" /> {t("customLlm.add")}
                    </Button>
                </div>

                <div className="divide-y divide-gray-50">
                    {models.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                            {t("customLlm.noProviders")}<br />
                            {t("customLlm.noProvidersDesc")}
                        </div>
                    ) : (
                        models.map(model => (
                            <div key={model.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-800">{model.name}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                        {model.model} • {model.baseUrl.replace(/^https?:\/\//, '').split('/')[0]}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(model)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(model.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title={t("customLlm.delete")}
                description={t("customLlm.deleteConfirm")}
                confirmText={t("customLlm.delete")}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}
