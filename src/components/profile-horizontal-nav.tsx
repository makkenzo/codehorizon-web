'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { ProfileNavItem } from '@/types';

import { Button } from './ui/button';

interface ProfileHorizontalNavProps {}

const profileNavLinks: ProfileNavItem[] = [
    {
        label: 'Профиль',
        href: '/me/profile',
    },
    {
        label: 'Персонализация',
        href: '/me/personalization',
    },
    {
        label: 'Аккаунт',
        href: '/me/account',
    },
    {
        label: 'Способы оплаты',
        href: '/me/payment-methods',
    },
    {
        label: 'Уведомления',
        href: '/me/notifications',
    },
    {
        label: 'Конфиденциальность',
        href: '/me/privacy',
    },
];

const ProfileHorizontalNav = ({}: ProfileHorizontalNavProps) => {
    const pathname = usePathname();

    return (
        <>
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="text-xl font-bold text-center"
            >
                Личный кабинет
            </motion.h1>
            <div className="flex gap-4 items-center mx-auto">
                {profileNavLinks.map((link, index) => (
                    <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 4) * 0.1, duration: 0.3 }}
                    >
                        <Link href={link.href}>
                            <Button
                                variant="link"
                                className={cn(
                                    'font-normal text-foreground underline-offset-[12px] decoration-2 decoration-primary',
                                    pathname === link.href && 'underline'
                                )}
                            >
                                {link.label}
                            </Button>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default ProfileHorizontalNav;

