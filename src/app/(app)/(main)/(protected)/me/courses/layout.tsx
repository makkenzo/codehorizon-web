'use client';

import { useSearchParams } from 'next/navigation';

import HorizontalTabNav from '@/components/horizontal-tab-nav';
import PageWrapper from '@/components/reusable/page-wrapper';
import { tabMeta } from '@/lib/reducers/my-courses-reducer';
import { HorizontalTabNavItem } from '@/types';

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const currentTabKey = (searchParams.get('tab') ?? 'default') as keyof typeof tabMeta;
    const currentMetaData = tabMeta[currentTabKey] ?? tabMeta.default;

    const navLinks: HorizontalTabNavItem[] = [
        {
            label: 'Все курсы',
            href: '/me/courses',
            disabled: false,
        },
        {
            label: tabMeta.wishlist.title,
            href: '/me/courses?tab=wishlist',
            disabled: false,
        },
        {
            label: tabMeta.completed.title,
            href: '/me/courses?tab=completed',
            disabled: true,
        },
    ];

    return (
        <PageWrapper>
            <div className="flex flex-col">
                <div className="gap-4 flex flex-col mb-6 md:mb-8">
                    <HorizontalTabNav title={currentMetaData.title} tabs={navLinks} />
                </div>
                {children}
            </div>
        </PageWrapper>
    );
}
