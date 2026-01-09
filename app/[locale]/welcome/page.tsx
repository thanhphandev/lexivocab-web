'use client';

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import {
    Rocket,
} from "lucide-react";
import { DemoTextArea } from "@/components/welcome/demo-text-area";


export default function WelcomePage() {
    const t = useTranslations('Welcome');

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden">

            {/* Interactive Demo Section */}
            <section className="py-12 md:py-10">
                <div className="container px-4 md:px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                            <Rocket className="w-4 h-4" />
                            {t('demo_badge')}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                            {t('demo_title')}
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            {t('demo_description')}
                        </p>
                    </motion.div>

                    {/* Demo Text Area Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <DemoTextArea />
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
