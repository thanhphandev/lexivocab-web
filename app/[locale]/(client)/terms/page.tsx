import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Terms' });
    const tMeta = await getTranslations({ locale, namespace: 'Metadata' });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lexivocab.store';

    return {
        title: t('title'),
        description: t('acceptance_desc'),
        alternates: {
            canonical: `${baseUrl}/${locale}/terms`,
            languages: {
                'en': `${baseUrl}/en/terms`,
                'vi': `${baseUrl}/vi/terms`,
                'ja': `${baseUrl}/ja/terms`,
                'zh': `${baseUrl}/zh/terms`,
            },
        },
        openGraph: {
            title: `${t('title')} | LexiVocab`,
            description: t('acceptance_desc'),
            url: `${baseUrl}/${locale}/terms`,
            siteName: 'LexiVocab',
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: `${t('title')} | LexiVocab`,
            description: t('acceptance_desc'),
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params;

    return <TermsContent locale={locale} />;
}

function TermsContent({ locale }: { locale: string }) {
    const t = useTranslations('Terms');

    return (
        <main className="min-h-screen py-20">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </Link>

                <article className="prose prose-orange max-w-none">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mb-8">{t('last_updated')}</p>

                    <section className="space-y-8">
                        <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('acceptance_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('acceptance_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('description_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('description_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('responsibilities_title')}</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>{t('resp_personal')}</li>
                                <li>{t('resp_reverse')}</li>
                                <li>{t('resp_illegal')}</li>
                                <li>{t('resp_copyright')}</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('ip_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('ip_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('disclaimer_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('disclaimer_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('liability_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('liability_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('changes_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('changes_desc')}
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-muted/50 border">
                            <h2 className="text-2xl font-semibold mb-4">{t('contact_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('contact_desc')}
                                <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline ml-1 font-medium">
                                    {siteConfig.email}
                                </a>
                            </p>
                        </div>
                    </section>
                </article>
            </div>
        </main>
    );
}
