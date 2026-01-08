import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params;

    return (
        <main className="min-h-screen py-20">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <article className="prose prose-orange max-w-none">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: January 8, 2024</p>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to LexiVocab. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you use our
                                Chrome extension and website.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                LexiVocab collects minimal data to provide you with the best vocabulary learning experience:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Vocabulary Data:</strong> Words you save, their translations, and context sentences. This data is stored locally on your device.</li>
                                <li><strong>Settings:</strong> Your preferences such as highlight colors and language settings.</li>
                                <li><strong>Usage Analytics:</strong> Anonymous usage statistics to improve our service (optional).</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>To provide and maintain our service</li>
                                <li>To improve and personalize your experience</li>
                                <li>To understand how users interact with our extension</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">4. Data Storage</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All your vocabulary data is stored locally on your device using Chrome's storage API.
                                We do not upload your personal vocabulary data to any external servers.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may use third-party translation APIs to provide contextual translations.
                                These services receive only the text you choose to translate and do not have access
                                to your personal information or saved vocabulary.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You have the right to access, correct, or delete your data at any time through the
                                extension's settings. You can also export your vocabulary data or clear all stored data.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:
                                <a href="mailto:support@lexivocab.com" className="text-primary hover:underline ml-1">
                                    support@lexivocab.com
                                </a>
                            </p>
                        </div>
                    </section>
                </article>
            </div>
        </main>
    );
}
