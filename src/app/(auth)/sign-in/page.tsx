import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';

import SignInPageContent from '@/components/page-contents/sign-in';

const SignInPage = () => {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-screen flex items-center justify-center flex-col">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            }
        >
            <SignInPageContent />
        </Suspense>
    );
};

export default SignInPage;

