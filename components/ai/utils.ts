import type { WordExplanationDto } from "@/lib/api/types";

export interface PartialAI extends Partial<WordExplanationDto> {
    story?: string;
    translation?: string;
    mnemonic?: string;
    imagePrompt?: string;
}

export function parsePartialAIJson(raw: string): PartialAI {
    if (!raw) return {};

    try {
        const fullParsed = JSON.parse(raw);
        if (typeof fullParsed === 'object' && fullParsed !== null) {
            return fullParsed;
        }
    } catch {
        // Fallback for partial streaming JSON
    }

    const partial: PartialAI = {};

    const extractString = (key: string) => {
        const match = raw.match(new RegExp(`"${key}"\\s*:\\s*"([^]*?)(?:"\\s*(?:,|})|$)`));
        if (match) {
            return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        return undefined;
    };

    const extractArray = (key: string) => {
        const contentMatch = raw.match(new RegExp(`"${key}"\\s*:\\s*\\[([^]*?)(?:\\])?(?=\\s*(?:,|}|$))`));
        if (contentMatch) {
            const innerRegex = /"([^]*?)(?:"|$)/g;
            const items: string[] = [];
            let itemMatch;
            while ((itemMatch = innerRegex.exec(contentMatch[1])) !== null) {
                const text = itemMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
                if (text && text !== ',') {
                    items.push(text);
                }
            }
            return items.length > 0 ? items : undefined;
        }
        return undefined;
    };

    partial.explanation = extractString("explanation");
    partial.tip = extractString("tip");
    partial.nuances = extractArray("nuances");
    partial.examples = extractArray("examples");

    // Extensions for Story and Mnemonic
    partial.story = extractString("story");
    partial.translation = extractString("translation");
    partial.mnemonic = extractString("mnemonic");
    partial.imagePrompt = extractString("imagePrompt");

    return partial;
}
