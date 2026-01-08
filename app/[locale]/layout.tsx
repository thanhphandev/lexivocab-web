import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from 'next';
import "../globals.css";
import Header from '@/components/landing/header';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

import { locales } from '@/lib/i18n';

// Locale to OpenGraph locale mapping
const localeToOg: Record<string, string> = {
    en: 'en_US',
    vi: 'vi_VN',
    ja: 'ja_JP',
    zh: 'zh_CN'
};

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexivocab.com';

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: t('title'),
            template: t('titleTemplate'),
        },
        description: t('description'),
        keywords: t('keywords'),
        authors: [{ name: 'Thanh Phan' }],
        creator: 'Thanh Phan',
        publisher: 'LexiVocab',
        applicationName: 'LexiVocab',

        // Open Graph
        openGraph: {
            type: 'website',
            locale: localeToOg[locale] || 'en_US',
            alternateLocale: Object.values(localeToOg).filter(l => l !== localeToOg[locale]),
            url: `${baseUrl}/${locale}`,
            siteName: 'LexiVocab',
            title: t('title'),
            description: t('description'),
            images: [
                {
                    url: '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'LexiVocab - Learn Vocabulary While Browsing',
                }
            ],
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
            images: ['/twitter-image.png'],
            creator: '@lexivocab',
        },

        // Icons
        icons: {
            icon: [
                { url: '/icon.png', sizes: '32x32', type: 'image/png' },
                { url: '/favicon.ico', sizes: '32x32' },
            ],
            apple: [
                { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
            ],
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Verification (add your verification codes here)
        // verification: {
        //     google: 'your-google-verification-code',
        // },

        // Alternate languages
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                'en': `${baseUrl}/en`,
                'vi': `${baseUrl}/vi`,
                'ja': `${baseUrl}/ja`,
                'zh': `${baseUrl}/zh`,
            },
        },

        // Category
        category: 'Education',
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                {/* Structured Data - Organization */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "LexiVocab",
                            "applicationCategory": "EducationalApplication",
                            "operatingSystem": "Chrome",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "5.0",
                                "ratingCount": "1000"
                            },
                            "description": "Chrome extension for vocabulary learning while browsing"
                        })
                    }}
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
                <NextIntlClientProvider messages={messages}>
                    <Header locale={locale} />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
