import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/config';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params;

    return <PrivacyContent locale={locale} />;
}

function PrivacyContent({ locale }: { locale: string }) {
    const t = useTranslations('Privacy');

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
                            <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('intro_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('intro_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('data_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                {t('data_desc')}
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                                <li><strong className="text-foreground">Vocabulary Data:</strong> {t('data_vocab')}</li>
                                <li><strong className="text-foreground">Settings:</strong> {t('data_settings')}</li>
                                <li><strong className="text-foreground">Analytics:</strong> {t('data_analytics')}</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('usage_title')}</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>{t('usage_provide')}</li>
                                <li>{t('usage_improve')}</li>
                                <li>{t('usage_understand')}</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('storage_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('storage_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('third_party_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('third_party_desc')}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{t('rights_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('rights_desc')}
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
