import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'LexiVocab - Learn Vocabulary While Browsing',
        short_name: 'LexiVocab',
        description: 'A powerful Chrome extension that helps you learn vocabulary while browsing the web. Save words, translate instantly, and build your personal vocabulary list.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f0f23',
        theme_color: '#8b5cf6',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/apple-icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
