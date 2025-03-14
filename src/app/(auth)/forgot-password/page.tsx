import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';

import ForgotPasswordPageContent from '@/components/page-contents/forgot-password';

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
