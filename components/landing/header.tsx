'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Globe, Menu, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { locales, languageNames } from '@/lib/i18n';
import { siteConfig } from '@/lib/config';

export default function Header({ locale }: { locale: string }) {
    const t = useTranslations('Header');
    const tHero = useTranslations('Hero');

    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (newLocale: string) => {
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');
        router.push(newPath);
    };

    const languages = locales.map(code => ({ code, label: languageNames[code] }));

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href={`/${locale}`} className="flex items-center gap-3 group">
                    <Image
                        src="/icon.png"
                        alt="LexiVocab"
                        width={40}
                        height={40}
                        className="object-contain transition-transform group-hover:scale-110"
                    />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                        LexiVocab
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="#features"
                            className="transition-colors hover:text-primary text-muted-foreground"
                        >
                            {t('features')}
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="transition-colors hover:text-primary text-muted-foreground"
                        >
                            {t('how_it_works')}
                        </Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span className="hidden sm:inline">{languageNames[locale as keyof typeof languageNames]}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                                {languages.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className="cursor-pointer"
                                    >
                                        <span className={locale === lang.code ? "font-semibold text-primary" : ""}>{lang.label}</span>
                                        {locale === lang.code && <Check className="ml-auto h-4 w-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {tHero('cta_install')}
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 p-4">
                        <div className="flex items-center gap-3 mb-8">
                            <Image src="/icon.png" alt="LexiVocab" width={32} height={32} />
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                                LexiVocab
                            </span>
                        </div>
                        <nav className="flex flex-col gap-4">
                            <Link href="#features" className="font-medium py-2 hover:text-primary transition-colors">
                                {t('features')}
                            </Link>
                            <Link href="#how-it-works" className="font-medium py-2 hover:text-primary transition-colors">
                                {t('how_it_works')}
                            </Link>
                            <hr className="my-2" />
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground font-medium">{t('language')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${locale === lang.code
                                                ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-medium'
                                                : 'hover:bg-muted'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <hr className="my-2" />
                            <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {tHero('cta_install')}
                                </Button>
                            </a>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
