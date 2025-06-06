import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import ResetPasswordPageContent from '@/components/page-contents/reset-password';
import { resetPasswordPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = resetPasswordPageMetadata;

const ResetPasswordPage = () => {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-screen flex items-center justify-center flex-col">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            }
        >
            <ResetPasswordPageContent />
            <h1>asdasd</h1>
        </Suspense>
    );
};

export default ResetPasswordPage;
