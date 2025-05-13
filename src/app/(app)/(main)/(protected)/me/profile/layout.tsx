import HorizontalTabNav from '@/components/horizontal-tab-nav';
import PageWrapper from '@/components/reusable/page-wrapper';
import { HorizontalTabNavItem } from '@/types';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const profileNavLinks: HorizontalTabNavItem[] = [
        {
            label: 'Профиль',
            href: '/me/profile',
            disabled: false,
        },
        {
            label: 'Персонализация',
            href: '/me/profile?tab=personalization',
            disabled: true,
        },
        {
            label: 'Уведомления',
            href: '/me/profile?tab=notifications',
            disabled: false,
        },
        {
            label: 'Конфиденциальность',
            href: '/me/profile?tab=privacy',
            disabled: false,
        },
    ];

    return (
        <PageWrapper className="max-w-[845px]">
            <div className="flex flex-col">
                <div className="gap-4 flex flex-col">
                    <HorizontalTabNav title="Личный кабинет" tabs={profileNavLinks} />
                </div>
                <div className="p-4">{children}</div>
            </div>
        </PageWrapper>
    );
}
