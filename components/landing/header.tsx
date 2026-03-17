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
import { useAuth } from '@/lib/auth/auth-context';

export default function Header({ locale }: { locale: string }) {
    const t = useTranslations('Header');
    const tHero = useTranslations('Hero');
    const tAuth = useTranslations('Auth');

    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

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
                        <Link
                            href={`/${locale}/pricing`}
                            className="transition-colors hover:text-primary text-muted-foreground"
                        >
                            {t('pricing')}
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

                        <div className="flex items-center gap-2 border-l pl-4 ml-2 border-border/50">
                            {isLoading ? (
                                <div className="w-20 h-8 animate-pulse bg-muted rounded-md" />
                            ) : isAuthenticated ? (
                                <Link href={`/${locale}/dashboard`}>
                                    <Button
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold px-5"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={`/${locale}/auth/login`}>
                                        <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
                                            {tAuth('loginLink')}
                                        </Button>
                                    </Link>
                                    <Link href={`/${locale}/auth/register`}>
                                        <Button
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold px-5"
                                        >
                                            {tAuth('registerButton')}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
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
                            <Link href={`/${locale}/pricing`} className="font-medium py-2 hover:text-primary transition-colors">
                                {t('pricing')}
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
                            <div className="flex flex-col gap-2 mt-4">
                                {isLoading ? (
                                    <div className="w-full h-10 animate-pulse bg-muted rounded-md" />
                                ) : isAuthenticated ? (
                                    <Link href={`/${locale}/dashboard`} className="w-full">
                                        <Button className="w-full justify-center bg-primary text-primary-foreground">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={`/${locale}/auth/login`} className="w-full">
                                            <Button variant="outline" className="w-full justify-center">
                                                {tAuth('loginLink')}
                                            </Button>
                                        </Link>
                                        <Link href={`/${locale}/auth/register`} className="w-full">
                                            <Button className="w-full justify-center bg-primary text-primary-foreground">
                                                {tAuth('registerButton')}
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
