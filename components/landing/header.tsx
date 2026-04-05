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
        <header className="fixed top-0 inset-x-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
            <div className="container flex h-16 md:h-20 items-center justify-between mx-auto px-4 md:px-6">
                {/* Brand */}
                <Link href={`/${locale}`} className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src="/icon.png"
                            alt="LexiVocab"
                            fill
                            className="object-contain drop-shadow-sm"
                        />
                    </div>
                    <span className="text-[1.35rem] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
                        LexiVocab
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <Link
                            href="#features"
                            className="relative py-1 transition-colors hover:text-orange-600 group"
                        >
                            {t('features')}
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="relative py-1 transition-colors hover:text-orange-600 group"
                        >
                            {t('how_it_works')}
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    </nav>
                    
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        {/* Language Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-full px-3">
                                    <Globe className="h-4 w-4 text-slate-400" />
                                    <span className="hidden sm:inline">{languageNames[locale as keyof typeof languageNames]}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50">
                                {languages.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${locale === lang.code ? 'bg-orange-50/80 text-orange-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <span className={`flex-1 ${locale === lang.code ? "font-bold" : "font-medium"}`}>{lang.label}</span>
                                        {locale === lang.code && <Check className="h-4 w-4 text-orange-600" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* CTA */}
                        <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                                size="sm"
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 py-5 font-semibold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
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
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-700">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 border-l-0 shadow-2xl rounded-l-3xl bg-white/95 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-10 pt-2">
                            <div className="relative w-8 h-8">
                                <Image src="/icon.png" alt="LexiVocab" fill className="object-contain" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
                                LexiVocab
                            </span>
                        </div>
                        
                        <nav className="flex flex-col gap-2">
                            <Link href="#features" className="text-lg font-bold py-3 text-slate-700 hover:text-orange-600 transition-colors border-b border-slate-100">
                                {t('features')}
                            </Link>
                            <Link href="#how-it-works" className="text-lg font-bold py-3 text-slate-700 hover:text-orange-600 transition-colors border-b border-slate-100">
                                {t('how_it_works')}
                            </Link>
                            
                            <div className="mt-8 space-y-4">
                                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">{t('language')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${locale === lang.code
                                                ? 'bg-orange-50 border border-orange-100 text-orange-700 font-bold shadow-sm'
                                                : 'bg-slate-50 border border-transparent text-slate-600 font-medium hover:bg-slate-100'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <a href={siteConfig.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                    <Button
                                        size="lg"
                                        className="w-full bg-slate-900 text-white rounded-xl h-14 font-semibold shadow-md active:scale-95 transition-transform"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        {tHero('cta_install')}
                                    </Button>
                                </a>
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
