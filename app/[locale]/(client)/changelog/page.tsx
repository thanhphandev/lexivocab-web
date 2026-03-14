import { getTranslations, getFormatter } from 'next-intl/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { versions } from '@/lib/changelog';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Changelog' });

    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function ChangelogPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Changelog' });
    const tTerms = await getTranslations({ locale, namespace: 'Terms' });
    const format = await getFormatter({ locale });

    return (
        <main className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-orange-50/20 via-white to-orange-50/40">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="mb-16 text-center">
                    <div className="inline-block p-3 rounded-full bg-orange-100 mb-4 animate-fade-in">
                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-200 before:via-orange-100 before:to-transparent">
                    {versions.map((release, index) => (
                        <div key={release.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">

                            {/* Icon/Dot */}
                            <div className="absolute left-0 md:static md:w-1/2 flex justify-center before:hidden md:before:block">
                                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-md shrink-0 
                                    ${index === 0 ? 'bg-orange-500' : 'bg-slate-200'}`}>
                                    {index === 0 && (
                                        <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                    )}
                                </div>
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-3.5rem)] ml-14 md:ml-0 md:w-[calc(50%-2.5rem)] bg-white p-6 md:p-8 rounded-2xl border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-orange-50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-bold text-xl text-slate-900">
                                            v{release.version}
                                        </h2>
                                        {index === 0 && (
                                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <time className="font-mono text-sm text-slate-500 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {format.dateTime(new Date(release.date), {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                </div>
                                <ul className="space-y-4">
                                    {release.changes.map((change, i) => (
                                        <li key={i} className="flex items-start group/item">
                                            <span className="mr-3 mt-2 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 group-hover/item:scale-125 transition-transform" />
                                            <span className="text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">
                                                {t(change)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all font-medium shadow-sm hover:shadow"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {tTerms('back')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
