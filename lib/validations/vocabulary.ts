import { z } from "zod";

export const getAddWordSchema = (t: (key: string) => string) => z.object({
  wordText: z.string().min(1, { message: t("required") }).max(150, { message: t("tooLong") }),
  customMeaning: z.string().max(1000, { message: t("tooLong") }).optional(),
  contextSentence: z.string().max(1000, { message: t("tooLong") }).optional(),
  sourceUrl: z.url({ message: t("invalidUrl") }).max(2000, { message: t("tooLong") }).optional().or(z.literal('')),
  tagId: z.string().optional().or(z.literal('none')),
});

export type AddWordInput = z.infer<ReturnType<typeof getAddWordSchema>>;

export const getBatchImportSchema = (t: (key: string) => string) => z.object({
  words: z.array(z.object({
    wordText: z.string().min(1, { message: t("required") }).max(150, { message: t("tooLong") }),
    customMeaning: z.string().max(1000, { message: t("tooLong") }).optional(),
    contextSentence: z.string().max(1000, { message: t("tooLong") }).optional(),
  })).min(1, { message: t("required") })
});

export type BatchImportInput = z.infer<ReturnType<typeof getBatchImportSchema>>;
