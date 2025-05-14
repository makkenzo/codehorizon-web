import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import ProfilePageContent from '@/components/page-contents/profile';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Мой профиль',
    description: 'Управляйте своим профилем, настройками и подписками на CodeHorizon.',
    path: '/me/profile',
});

const ProfilePage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center p-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }
        >
            <ProfilePageContent />
        </Suspense>
    );
};

export default ProfilePage;
