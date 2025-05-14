import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import ForgotPasswordPageContent from '@/components/page-contents/forgot-password';
import { forgotPasswordPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = forgotPasswordPageMetadata;

const ForgotPassword = () => {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-screen flex items-center justify-center flex-col">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            }
        >
            <ForgotPasswordPageContent />
        </Suspense>
    );
};

export default ForgotPassword;
