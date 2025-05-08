'use client';

import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { LucideProps, Menu, Package2, X } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface AdminMobileMenuProps {
    navLinks: {
        id: string;
        href: string;
        label: string;
        icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
        className?: string;
    }[];
}

const AdminMobileMenu = ({ navLinks }: AdminMobileMenuProps) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const pathname = usePathname();

    const closeSheet = () => setIsSheetOpen(false);

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="Открыть меню админки">
                    <AnimatePresence mode="wait" initial={false}>
                        {isSheetOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                exit={{ rotate: 90, scale: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X size={24} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                exit={{ rotate: -90, scale: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu size={24} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-full sm:w-[300px] p-4">
                <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold mb-4" onClick={closeSheet}>
                    <Package2 className="h-6 w-6 text-primary" />
                    <span>CodeHorizon Admin</span>
                </Link>
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {navLinks.map((item, index) => {
                        const IconComponent = item.icon as React.ElementType | undefined;
                        const isActive = pathname === item.href;

                        return (
                            <motion.div
                                key={item.id + '-motion-admin'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: (index + 1) * 0.05, duration: 0.2 }}
                            >
                                {item.href ? (
                                    <Link href={item.href} onClick={closeSheet}>
                                        <Button
                                            variant={isActive ? 'secondary' : 'ghost'}
                                            className={cn('w-full justify-start gap-2', item.className)}
                                            size="lg"
                                        >
                                            {IconComponent && <IconComponent className="h-4 w-4" />}
                                            {item.label}
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className={cn('w-full justify-start gap-2', item.className)}
                                        size="lg"
                                        disabled
                                    >
                                        {IconComponent && <IconComponent className="h-4 w-4" />}
                                        {item.label}
                                    </Button>
                                )}
                            </motion.div>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
};

export default AdminMobileMenu;
