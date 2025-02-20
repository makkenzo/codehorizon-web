import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';

import ResetPasswordPageContent from '@/components/page-contents/reset-password';

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
        </Suspense>
    );
};

export default ResetPasswordPage;

