import HeroSection from '@/components/landing/hero-section';
import VideoDemoSection from '@/components/landing/video-demo-section';
import FeatureGrid from '@/components/landing/feature-grid';
import HowItWorks from '@/components/landing/how-it-works';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {

    return (
        <main className="flex min-h-screen flex-col">
            <HeroSection />
            <VideoDemoSection />
            <FeatureGrid />
            <HowItWorks />
        </main>
    );
}
