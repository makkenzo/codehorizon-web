import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import MyCoursesContent from '@/components/page-contents/my-courses';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Мои курсы',
    description: 'Просматривайте ваши активные, желаемые и завершенные курсы на CodeHorizon.',
    path: '/me/courses',
});

const MyCoursesPage = () => {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <MyCoursesContent />
        </Suspense>
    );
};

export default MyCoursesPage;
