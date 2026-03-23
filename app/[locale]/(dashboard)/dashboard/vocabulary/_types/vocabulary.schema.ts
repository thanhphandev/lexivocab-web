import { z } from "zod";

export const vocabularyFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
  filter: z.enum(["all", "active", "archived"]).default("active"),
  tagFilter: z.string().default("all"),
});

export type VocabularyFilter = z.infer<typeof vocabularyFilterSchema>;

export const exportFormatSchema = z.enum(["csv", "json", "quizlet", "txt"]);
export type ExportFormat = z.infer<typeof exportFormatSchema>;
