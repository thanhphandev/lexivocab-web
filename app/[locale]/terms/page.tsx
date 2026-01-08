import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
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
                    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">Last updated: January 8, 2024</p>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By installing and using LexiVocab Chrome Extension, you agree to be bound by these
                                Terms of Service. If you do not agree to these terms, please do not use our service.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                LexiVocab is a Chrome browser extension designed to help users learn vocabulary
                                while browsing the web. Features include text translation, vocabulary saving,
                                word highlighting, and vocabulary management.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Use the extension only for personal, non-commercial purposes</li>
                                <li>Not attempt to reverse-engineer or modify the extension</li>
                                <li>Not use the extension for any illegal activities</li>
                                <li>Respect copyright when saving content from websites</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                LexiVocab and its original content, features, and functionality are owned by
                                Phan Van Thanh and are protected by international copyright, trademark, and
                                other intellectual property laws.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">5. Disclaimer of Warranties</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The extension is provided "as is" without warranty of any kind. We do not guarantee
                                the accuracy of translations or that the service will be uninterrupted or error-free.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                In no event shall LexiVocab or its developer be liable for any indirect, incidental,
                                special, consequential, or punitive damages arising from your use of the extension.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of
                                significant changes through the extension or our website.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For any questions regarding these Terms of Service, please contact us at:
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
