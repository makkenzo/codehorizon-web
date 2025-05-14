import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import SignUpPageContent from '@/components/page-contents/sign-up';
import { signUpPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = signUpPageMetadata;

const SignUpPage = () => {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-screen flex items-center justify-center flex-col">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            }
        >
            <SignUpPageContent />
        </Suspense>
    );
};

export default SignUpPage;
