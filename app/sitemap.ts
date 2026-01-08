import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexivocab.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes: MetadataRoute.Sitemap = [];

    // Add home page for each locale
    locales.forEach((locale) => {
        routes.push({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
            alternates: {
                languages: Object.fromEntries(
                    locales.map((l) => [l, `${baseUrl}/${l}`])
                ),
            },
        });

        // Privacy page
        routes.push({
            url: `${baseUrl}/${locale}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        });

        // Terms page
        routes.push({
            url: `${baseUrl}/${locale}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        });
    });

    return routes;
}
