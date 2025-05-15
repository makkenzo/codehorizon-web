import HorizontalTabNav from '@/components/horizontal-tab-nav';
import { HorizontalTabNavItem } from '@/types';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const profileNavLinks: HorizontalTabNavItem[] = [
        {
            label: 'Профиль',
            href: '/me/profile',
            disabled: false,
        },
        {
            label: 'Достижения',
            href: '/me/profile?tab=achievements',
            disabled: false,
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
        <div className="flex flex-col mt-[40px]">
            <div className="gap-4 flex flex-col">
                <HorizontalTabNav title="Личный кабинет" tabs={profileNavLinks} />
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}
