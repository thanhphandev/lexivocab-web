// Centralized configuration for external links and settings
export const siteConfig = {
    name: 'LexiVocab',
    description: 'Learn vocabulary passively while browsing the web',

    // Chrome Web Store link - Update this when extension is published
    chromeWebStoreUrl: process.env.NEXT_PUBLIC_EXTENSION_URL || 'https://chromewebstore.google.com/detail/aoojcebhfcfiiecmmhecjjhbioagkajg?utm_source=item-share-cb',
    demoVideoUrl: process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || 'lzOxolr2PgY',
    // Social links
    social: {
        github: 'https://github.com/thanhphandev',
    },

    // Contact
    email: 'support@lexivocab.com',

    // Author
    author: {
        name: 'Phan Văn Thành',
        url: 'https://github.com/thanhphandev',
    },

    // Telegram Logic (Server-side only usually, but we keep structure here)
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
    }
} as const;
