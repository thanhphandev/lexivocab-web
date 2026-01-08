'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Send } from 'lucide-react';

interface FormActionsProps {
    backHref?: string;
    backLabel: string;
    submitLabel: string;
    submittingLabel: string;
    isSubmitting: boolean;
    isDisabled?: boolean;
}

export function FormActions({
    backHref = '/',
    backLabel,
    submitLabel,
    submittingLabel,
    isSubmitting,
    isDisabled = false
}: FormActionsProps) {
    return (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <Link
                href={backHref}
                className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors"
            >
                {backLabel}
            </Link>
            <Button
                type="submit"
                disabled={isSubmitting || isDisabled}
                size="lg"
                className="w-full sm:w-auto min-w-[160px] rounded-full font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {submittingLabel}
                    </>
                ) : (
                    <>
                        {submitLabel}
                        <Send className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
    );
}
