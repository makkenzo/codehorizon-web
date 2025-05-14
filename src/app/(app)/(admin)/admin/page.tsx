import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import AdminDashboardPageContent from '@/components/page-contents/admin/dashboard';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Панель администратора',
    description: 'Панель управления CodeHorizon.',
    path: '/admin',
});

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <AdminDashboardPageContent />
        </Suspense>
    );
}
