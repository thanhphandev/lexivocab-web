'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Zap, HelpCircle, Search, Ban, MessageSquare, RefreshCw } from 'lucide-react';
import {
    PageWrapper,
    PageHeader,
    FormCard,
    SuccessCard,
    OptionSelector,
    TextAreaField,
    FormActions,
    type Option
} from '@/components/feedback';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/lib/config';

export default function UninstallPage() {
    const t = useTranslations('Uninstall');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const reasons: Option[] = [
        { id: 'buggy', icon: AlertCircle, label: t('reasons.buggy') },
        { id: 'slow', icon: Zap, label: t('reasons.slow') },
        { id: 'complicated', icon: HelpCircle, label: t('reasons.complicated') },
        { id: 'alternative', icon: Search, label: t('reasons.alternative') },
        { id: 'not_useful', icon: Ban, label: t('reasons.not_useful') },
        { id: 'other', icon: MessageSquare, label: t('reasons.other') },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReason) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('type', 'uninstall');
            formData.append('reason', selectedReason);
            if (comment) formData.append('message', comment);

            await fetch('/api/feedback', {
                method: 'POST',
                body: formData,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }
    };

    return (
        <PageWrapper>
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <div key="form">
                        <PageHeader
                            icon={AlertTriangle}
                            iconColor="red"
                            title={t('title')}
                            subtitle={t('subtitle')}
                        />

                        <FormCard onSubmit={handleSubmit}>
                            <OptionSelector
                                options={reasons}
                                selected={selectedReason}
                                onSelect={setSelectedReason}
                                columns={2}
                            />

                            <TextAreaField
                                id="comment"
                                label={t('comment_placeholder')}
                                value={comment}
                                onChange={setComment}
                                placeholder="Tell us what happened..."
                                rows={4}
                            />

                            <FormActions
                                backLabel={t('back_home')}
                                submitLabel={t('submit')}
                                submittingLabel={t('submitting')}
                                isSubmitting={isSubmitting}
                                isDisabled={!selectedReason}
                            />
                        </FormCard>
                    </div>
                ) : (
                    <SuccessCard
                        key="success"
                        title={t('thank_you_title')}
                        description={t('thank_you_desc')}
                        backHomeText={t('back_home')}
                        extraAction={{
                            label: t('reinstall'),
                            icon: <RefreshCw className="mr-2 h-4 w-4" />,
                            onClick: () => router.push(siteConfig.chromeWebStoreUrl)
                        }}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
