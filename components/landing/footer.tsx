'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/lib/config';

export default function Footer({ locale }: { locale: string }) {
    const t = useTranslations('Footer');
    const tHeader = useTranslations('Header');
    const tFeatures = useTranslations('Features');

    return (
        <footer className="w-full border-t bg-gradient-to-b from-white to-orange-50/30">
            <div className="container px-4 md:px-6 mx-auto py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href={`/${locale}`} className="flex items-center gap-3">
                            <Image src="/icon.png" alt="LexiVocab" width={40} height={40} className="object-contain" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                                LexiVocab
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {t('copyright')}
                        </p>
                    </div>

                    {/* Features Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">{tHeader('features')}</h4>
                        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="#features" className="hover:text-primary transition-colors">
                                {tFeatures('smart_bubble_title')}
                            </Link>
                            <Link href="#features" className="hover:text-primary transition-colors">
                                {tFeatures('context_trans_title')}
                            </Link>
                            <Link href="#features" className="hover:text-primary transition-colors">
                                {tFeatures('highlight_title')}
                            </Link>
                            <Link href="#features" className="hover:text-primary transition-colors">
                                {tFeatures('dashboard_title')}
                            </Link>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">{t('legal')}</h4>
                        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href={`/${locale}/privacy`} className="hover:text-primary transition-colors">
                                {t('privacy')}
                            </Link>
                            <Link href={`/${locale}/terms`} className="hover:text-primary transition-colors">
                                {t('terms')}
                            </Link>
                        </nav>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">{t('connect')}</h4>
                        <div className="flex gap-4">
                            <a
                                href={siteConfig.social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                aria-label="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a
                                href={siteConfig.social.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                aria-label="Twitter"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href={`mailto:${siteConfig.email}`}
                                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                aria-label="Email"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>{t('made_with_love')}</p>
                </div>
            </div>
        </footer>
    );
}
