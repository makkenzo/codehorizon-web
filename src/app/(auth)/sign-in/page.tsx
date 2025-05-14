import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import SignInPageContent from '@/components/page-contents/sign-in';
import { signInPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = signInPageMetadata;

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
