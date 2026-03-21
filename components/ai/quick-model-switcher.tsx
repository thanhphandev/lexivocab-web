"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo, useRef } from "react";
import { settingsApi } from "@/lib/api/api-client";

interface QuickModelSwitcherProps {
    provider: string;
    setProvider: (val: string) => void;
    onTriggerAi?: () => void;
    isStreaming?: boolean;
    disabled?: boolean;
    hideTrigger?: boolean;
}

export function QuickModelSwitcher({ provider, setProvider, onTriggerAi, isStreaming, disabled, hideTrigger }: QuickModelSwitcherProps) {
    const { permissions } = useAuth();
    const llmConfigStr = permissions?.featureFlags?.['AVAILABLE_LLM_MODELS'];
    const isPremium = permissions?.plan === 'Premium' || permissions?.plan === 'Ultimate';

    const [customModels, setCustomModels] = useState<any[]>([]);
    const hasFetched = useRef(false);

    // 1. Memoize danh sách model để tránh tính toán thừa
    const availableModels = useMemo(() => {
        const baseModels: any[] = [
            { id: "google", name: "Google", group: "Engines" },
        ];
        let featureModels: any[] = [];
        try {
            if (llmConfigStr) featureModels = JSON.parse(llmConfigStr);
        } catch { }

        if (featureModels.length > 0) {
            return [...baseModels, ...featureModels];
        }

        return [
            ...baseModels,
            { id: "cloudflare/@cf/meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", group: "Free Models" },
            { id: "chrome-ai", name: "Chrome AI", group: "Free Models" }
        ];
    }, [llmConfigStr]);

    // 2. Phân loại model ngay trong useMemo
    const groups = useMemo(() => {
        return {
            engines: availableModels.filter((m: any) => m.group === "Engines"),
            free: availableModels.filter((m: any) => !m.isPro && m.group !== "Engines"),
            pro: availableModels.filter((m: any) => m.isPro),
        };
    }, [availableModels]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        settingsApi.get().then(res => {
            let loadedCustomModels: any[] = [];
            if (res.success && res.data?.customLlmsJson) {
                try {
                    loadedCustomModels = JSON.parse(res.data.customLlmsJson);
                    if (Array.isArray(loadedCustomModels)) setCustomModels(loadedCustomModels);
                } catch { }
            }

            // Chỉ set provider nếu hiện tại chưa có giá trị
            if (!provider && res.success) {
                const defaultFromApi = res.data?.defaultTranslator;
                const allPossibleModels = [...availableModels, ...loadedCustomModels];

                // Kiểm tra xem provider mặc định từ API có tồn tại trong danh sách model không
                const isValid = allPossibleModels.some(m => m.id === defaultFromApi);

                if (isValid && defaultFromApi) {
                    setProvider(defaultFromApi);
                } else if (availableModels.length > 0) {
                    setProvider(availableModels[0].id);
                }
            } else if (!provider && !res.success && availableModels.length > 0) {
                setProvider(availableModels[0].id);
            }
        }).catch(() => {
            if (!provider && availableModels.length > 0) {
                setProvider(availableModels[0].id);
            }
        });
    }, [availableModels, provider, setProvider]);

    const handleProviderChange = async (newVal: string) => {
        if (newVal === provider) return;
        setProvider(newVal);
        try {
            await settingsApi.update({ defaultTranslator: newVal });
        } catch { }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={provider} onValueChange={handleProviderChange} disabled={isStreaming || disabled}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/50 border-dashed focus:ring-0">
                    <SelectValue placeholder="Select model..." />
                </SelectTrigger>
                <SelectContent>
                    {/* Engines Group */}
                    {groups.engines.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engines</div>
                            {groups.engines.map((m: any) => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
                            ))}
                        </>
                    )}

                    {/* Free Models Group */}
                    {groups.free.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-t border-border/40">Free Models</div>
                            {groups.free.map((m: any) => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
                            ))}
                        </>
                    )}

                    {/* Pro Models Group */}
                    {groups.pro.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 mt-1 text-[10px] font-bold text-primary uppercase tracking-wider border-t border-border/40">Pro Models</div>
                            {groups.pro.map((m: any) => (
                                <SelectItem key={m.id} value={m.id} className="text-xs" disabled={!isPremium}>
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span>{m.name}</span>
                                        {!isPremium && <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">PRO</span>}
                                    </div>
                                </SelectItem>
                            ))}
                        </>
                    )}

                    {/* Custom Models Group */}
                    {customModels.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 mt-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider border-t border-border/40">Custom (BYOK)</div>
                            {customModels.map((cm: any) => (
                                <SelectItem key={cm.id} value={cm.id} className="text-xs">
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span>{cm.name}</span>
                                        <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1 rounded font-bold">BYOK</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </>
                    )}
                </SelectContent>
            </Select>

            {!hideTrigger && onTriggerAi && (
                <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all shadow-none"
                    onClick={() => {
                        if (provider === "chrome-ai") return;
                        onTriggerAi();
                    }}
                    disabled={isStreaming || disabled || provider === "chrome-ai"}
                >
                    {isStreaming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span className="text-xs font-semibold">Auto-fill</span>
                </Button>
            )}
        </div>
    );
}