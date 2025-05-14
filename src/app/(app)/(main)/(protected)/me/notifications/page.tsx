import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import MyNotificationsPageContent from '@/components/page-contents/my-notifications';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Мои уведомления',
    description: 'Просматривайте все ваши уведомления на платформе CodeHorizon.',
    path: '/me/notifications',
});

const AllNotificationsPage = () => {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <MyNotificationsPageContent />
        </Suspense>
    );
};

export default AllNotificationsPage;
