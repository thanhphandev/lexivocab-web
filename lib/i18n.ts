export const locales = ['vi', 'en', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export const languageNames: Record<Locale, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    ja: '日本語',
    zh: '中文'
};
