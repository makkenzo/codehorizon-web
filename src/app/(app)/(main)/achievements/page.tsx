import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import AllAchievementsPageContent from '@/components/page-contents/all-achievements';
import PageWrapper from '@/components/reusable/page-wrapper';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Все достижения',
    description: 'Исследуйте все доступные достижения на платформе CodeHorizon и узнайте, как их получить.',
    path: '/achievements',
});

const AllAchievementsPage = () => {
    return (
        <PageWrapper className="mb-12">
            <Suspense
                fallback={
                    <div className="flex justify-center items-center p-20 min-h-[400px]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                }
            >
                <AllAchievementsPageContent />
            </Suspense>
        </PageWrapper>
    );
};

export default AllAchievementsPage;
