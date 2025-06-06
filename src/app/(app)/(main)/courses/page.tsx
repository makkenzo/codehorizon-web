import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import CoursesPageContent from '@/components/page-contents/courses';
import PageWrapper from '@/components/reusable/page-wrapper';
import { coursesPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = coursesPageMetadata;

const CoursesPage = () => {
    return (
        <Suspense
            fallback={
                <PageWrapper className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </PageWrapper>
            }
        >
            <CoursesPageContent />
        </Suspense>
    );
};

export default CoursesPage;
