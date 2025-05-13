'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { HorizontalTabNavItem } from '@/types';

import { Button } from './ui/button';

interface HorizontalTabNavProps {
    title: string;
    tabs: HorizontalTabNavItem[];
}

const HorizontalTabNav = ({ title, tabs }: HorizontalTabNavProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    const checkIsActive = (tabHref: string): boolean => {
        const [linkPathname, linkQueryString] = tabHref.split('?');
        const linkParams = new URLSearchParams(linkQueryString || '');
        const linkTab = linkParams.get('tab');

        const pathnameMatches = pathname === linkPathname;
        const tabMatches = currentTab === linkTab;

        return pathnameMatches && tabMatches;
    };

    return (
        <>
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="text-xl font-bold text-center"
            >
                {title}
            </motion.h1>
            <div className="flex gap-4 items-center mx-auto">
                {tabs.map((link, index) => (
                    <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 4) * 0.1, duration: 0.3 }}
                        aria-disabled={link.disabled}
                    >
                        {link.disabled ? (
                            <Button
                                disabled={link.disabled}
                                variant="link"
                                className={cn(
                                    'font-normal text-foreground underline-offset-[12px] decoration-2 decoration-primary',
                                    checkIsActive(link.href) && 'underline'
                                )}
                            >
                                {link.label}
                            </Button>
                        ) : (
                            <Link href={link.href} aria-disabled={link.disabled}>
                                <Button
                                    disabled={link.disabled}
                                    variant="link"
                                    className={cn(
                                        'font-normal text-foreground underline-offset-[12px] decoration-2 decoration-primary',
                                        checkIsActive(link.href) && 'underline'
                                    )}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default HorizontalTabNav;
