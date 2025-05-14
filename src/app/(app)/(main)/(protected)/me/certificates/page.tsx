import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

import MyCertificatesPageContent from '@/components/page-contents/my-certificates';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Мои сертификаты',
    description: 'Просматривайте и скачивайте сертификаты за пройденные курсы на CodeHorizon.',
    path: '/me/certificates',
});

const MyCertificatesPage = () => {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <MyCertificatesPageContent />
        </Suspense>
    );
};

export default MyCertificatesPage;
