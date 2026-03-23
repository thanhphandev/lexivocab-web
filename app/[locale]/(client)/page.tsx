import HeroSection from '@/components/landing/hero-section';
import VideoDemoSection from '@/components/landing/video-demo-section';
import FeatureGrid from '@/components/landing/feature-grid';
import HowItWorks from '@/components/landing/how-it-works';

export default async function Home() {

    return (
        <main className="flex min-h-screen flex-col">
            <HeroSection />
            <VideoDemoSection />
            <FeatureGrid />
            <HowItWorks />
        </main>
    );
}
