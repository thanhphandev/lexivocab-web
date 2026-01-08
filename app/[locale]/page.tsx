import HeroSection from '@/components/landing/hero-section';
import FeatureGrid from '@/components/landing/feature-grid';
import Footer from '@/components/landing/footer';

import HowItWorks from '@/components/landing/how-it-works';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
    const { locale } = await params;

    return (
        <main className="flex min-h-screen flex-col">
            <HeroSection />
            <FeatureGrid />
            <HowItWorks />
            <Footer locale={locale} />
        </main>
    );
}
