'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare, Bug, Zap, Mail } from 'lucide-react';
import {
    PageWrapper,
    PageHeader,
    FormCard,
    SuccessCard,
    OptionSelector,
    TextAreaField,
    InputField,
    StarRating,
    ImageUpload,
    FormActions,
    ErrorAlert,
    type Option
} from '@/components/feedback';

export default function FeedbackPage() {
    const t = useTranslations('Feedback');

    const [type, setType] = useState<string>('bug');
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions: Option[] = [
        { id: 'bug', icon: Bug, label: t('types.bug') },
        { id: 'feature', icon: Zap, label: t('types.feature') },
        { id: 'other', icon: MessageSquare, label: t('types.other') },
    ];

    const handleImagesAdd = (files: File[]) => {
        setImages(prev => [...prev, ...files]);
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newUrls]);
        setError(null);
    };

    const handleImageRemove = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const urlToRemove = prev[index];
            if (urlToRemove) URL.revokeObjectURL(urlToRemove);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('message', message);
            if (contact) formData.append('contact', contact);
            if (rating) formData.append('rating', rating.toString());
            images.forEach((image) => formData.append('images', image));

            const response = await fetch('/api/feedback', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to submit');
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            setError('Failed to send feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper>
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <div key="form">
                        <PageHeader
                            icon={MessageSquare}
                            iconColor="blue"
                            title={t('title')}
                            subtitle={t('subtitle')}
                        />

                        <FormCard onSubmit={handleSubmit}>
                            {/* Type Selection */}
                            <OptionSelector
                                options={typeOptions}
                                selected={type}
                                onSelect={setType}
                                columns={3}
                            />

                            {/* Message */}
                            <TextAreaField
                                id="message"
                                label={t('message_label')}
                                value={message}
                                onChange={setMessage}
                                placeholder={t('message_placeholder')}
                                required
                                rows={5}
                            />

                            {/* Image Upload */}
                            <ImageUpload
                                label={t('upload_label')}
                                images={images}
                                previewUrls={previewUrls}
                                onFilesAdd={handleImagesAdd}
                                onFileRemove={handleImageRemove}
                                maxFiles={5}
                                maxSizeMB={5}
                                placeholder={t('upload_placeholder')}
                            />

                            {/* Star Rating */}
                            <StarRating
                                label={t('rating_label')}
                                value={rating}
                                onChange={setRating}
                            />

                            {/* Contact Email */}
                            <InputField
                                id="contact"
                                label={t('contact_label')}
                                value={contact}
                                onChange={setContact}
                                placeholder={t('contact_placeholder')}
                                type="email"
                                icon={Mail}
                            />

                            {/* Error Alert */}
                            <ErrorAlert message={error} />

                            {/* Form Actions */}
                            <FormActions
                                backLabel={t('back_home')}
                                submitLabel={t('submit')}
                                submittingLabel={t('submitting')}
                                isSubmitting={isSubmitting}
                                isDisabled={!message.trim()}
                            />
                        </FormCard>
                    </div>
                ) : (
                    <SuccessCard
                        key="success"
                        title={t('success_title')}
                        description={t('success_desc')}
                        backHomeText={t('back_home')}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
