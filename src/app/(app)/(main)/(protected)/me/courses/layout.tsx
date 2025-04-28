import HorizontalTabNav from '@/components/horizontal-tab-nav';
import PageWrapper from '@/components/reusable/page-wrapper';
import { HorizontalTabNavItem } from '@/types';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const navLinks: HorizontalTabNavItem[] = [
        {
            label: 'Все курсы',
            href: '/me/courses',
            disabled: false,
        },
        {
            label: 'Желаемое',
            href: '/me/courses?tab=wishlist',
            disabled: false,
        },
        {
            label: 'Пройденные',
            href: '/me/courses?tab=completed',
            disabled: true,
        },
    ];

    return (
        <PageWrapper>
            <div className="flex flex-col">
                <div className="gap-4 flex flex-col">
                    <HorizontalTabNav title="Мои курсы" tabs={navLinks} />
                </div>
                <div className="p-4">{children}</div>
            </div>
        </PageWrapper>
    );
}
