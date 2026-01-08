import HeroSection from '@/components/landing/hero-section';
import FeatureGrid from '@/components/landing/feature-grid';
import Footer from '@/components/landing/footer';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
    const { locale } = await params;

    return (
        <main className="flex min-h-screen flex-col">
            <HeroSection />
            <FeatureGrid />
            <Footer locale={locale} />
        </main>
    );
}
