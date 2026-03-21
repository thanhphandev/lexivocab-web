import { notFound } from 'next/navigation';
import Header from '@/components/landing/header';
import { locales } from '@/lib/i18n';
import Footer from '@/components/landing/footer';

export default async function Layout({
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

    return (
        <>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
        </>
    );
}
