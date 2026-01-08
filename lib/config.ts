// Centralized configuration for external links and settings
export const siteConfig = {
    name: 'LexiVocab',
    description: 'Learn vocabulary passively while browsing the web',

    // Chrome Web Store link - Update this when extension is published
    chromeWebStoreUrl: 'https://chrome.google.com/webstore/detail/lexivocab',

    // Social links
    social: {
        github: 'https://github.com/thanhphandev',
        twitter: 'https://twitter.com/lexivocab',
    },

    // Contact
    email: 'support@lexivocab.com',

    // Author
    author: {
        name: 'Thanh Phan',
        url: 'https://github.com/thanhphandev',
    },

    // Telegram Logic (Server-side only usually, but we keep structure here)
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
    }
} as const;
