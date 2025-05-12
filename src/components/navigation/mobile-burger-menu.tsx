import React, { ElementType, createElement, isValidElement, useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, Bell, Book, ChevronUp, Heart, Home, Menu, Settings, ShieldQuestion, X } from 'lucide-react';
import { RiProfileFill, RiProfileLine, RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Profile } from '@/models';
import { useAuth } from '@/providers/auth-provider';
import { mentorshipApiClient } from '@/server/mentorship';
import { useUserStore } from '@/stores/user/user-store-provider';
import { NavItem } from '@/types';

import MentorshipApplicationModal from '../mentorship/mentorship-application-modal';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';

interface MobileBurgerMenuProps {
    profile?: Profile;
}

function renderIcon(Icon?: ElementType) {
    if (!Icon) return null;

    return createElement(Icon, {
        className: 'mr-2 h-4 w-4 opacity-70',
    });
}

const MobileBurgerMenu = ({ profile }: MobileBurgerMenuProps) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [expandedSubmenus, setExpandedSubmenus] = useState<{ [key: string]: boolean }>({});

    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [canApplyForMentorship, setCanApplyForMentorship] = useState(false);
    const [isCheckingMentorshipStatus, setIsCheckingMentorshipStatus] = useState(true);

    const { user } = useUserStore((state) => state);
    const { isAuthenticated, isPending: isAuthPending } = useAuth();

    const isMentor = useMemo(() => user?.roles?.includes('ROLE_MENTOR') || user?.roles?.includes('MENTOR'), [user]);
    const isAdmin = useMemo(() => user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN'), [user]);

    useEffect(() => {
        const checkMentorshipPossibility = async () => {
            if (isAuthenticated && user && !isMentor && !isAdmin) {
                setIsCheckingMentorshipStatus(true);
                try {
                    const hasActive = await mentorshipApiClient.hasActiveApplication();
                    setCanApplyForMentorship(!hasActive);
                } catch {
                    setCanApplyForMentorship(true);
                } finally {
                    setIsCheckingMentorshipStatus(false);
                }
            } else {
                setCanApplyForMentorship(false);
                setIsCheckingMentorshipStatus(false);
            }
        };
        if (!isAuthPending) {
            checkMentorshipPossibility();
        }
    }, [isAuthenticated, user, isMentor, isAdmin, isAuthPending]);

    const handleApplicationSuccess = () => {
        setIsApplicationModalOpen(false);
        setCanApplyForMentorship(false);
        setIsSheetOpen(false);
    };

    const toggleExpand = (label: string) => {
        setExpandedSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleBecomeMentorClick = () => {
        setIsApplicationModalOpen(true);
    };

    const closeSheetAndReset = () => {
        setIsSheetOpen(false);
        setExpandedSubmenus({});
    };

    const commonNavItems: NavItem[] = [
        {
            id: '54440642-cc40-5b73-96f1-a9e67bf0884f',
            href: '/',
            label: 'Главная',
            icon: Home,
        },
        {
            id: '3c4af7c0-5a5c-5432-9b2c-a6606a0df7be',
            label: 'Каталог',
            icon: Book,
            href: '/courses',
        },
        {
            id: '53ca9885-ba7a-5957-a305-7697cd654dda',
            href: '/me/courses?tab=wishlist',
            label: 'Список желаемого',
            icon: Heart,
        },
    ];

    const adminPanelItem: NavItem =
        isAuthenticated && user && (isAdmin || isMentor)
            ? {
                  id: 'admin-panel-mobile',
                  href: '/admin',
                  className: 'text-destructive',
                  label: 'Админ-панель',
                  icon: ShieldQuestion,
              }
            : null;

    const authNavItems: NavItem[] = profile
        ? [
              {
                  id: '02fac1a0-9fbc-530a-8507-d6c52d54cb69',
                  label: 'Личный кабинет',
                  icon: RiProfileFill,
                  className: 'text-primary',
                  subItems: [
                      {
                          id: '62be7feb-62f2-5fea-b4ff-a5022d48dbfc',
                          href: '/me/profile',
                          label: 'Профиль',
                          icon: RiProfileLine,
                          className: 'text-primary',
                      },
                      adminPanelItem,
                      {
                          id: 'certs-mobile-link',
                          href: '/me/certificates',
                          label: 'Мои Сертификаты',
                          icon: Award,
                          className: 'text-primary',
                      },
                      {
                          id: 'cb5283a9-cf5a-544d-940a-765e6a3190e0',
                          href: '/',
                          label: 'Уведомления',
                          icon: Bell,
                          className: 'text-primary',
                      },
                      {
                          id: '7fb21855-e088-5ee6-8a39-29afddbf10ea',
                          href: '/',
                          label: 'Настройки аккаунта',
                          icon: Settings,
                          className: 'text-primary',
                      },
                  ],
              },
          ]
        : [
              {
                  id: 'b4f46557-4a8e-5412-bc22-e8273f3923a8',
                  href: '/sign-in',
                  label: 'Вход',
                  icon: RiProgress5Line,
                  className: 'text-primary',
              },
              {
                  id: '486367d2-e2a0-521c-a4ca-8c050977873d',
                  href: '/sign-up',
                  label: 'Регистрация',
                  icon: RiProgress5Line,
                  className: 'text-primary',
              },
          ];

    const becomeMentorItem: NavItem =
        isAuthenticated && user && !isMentor && !isAdmin && canApplyForMentorship && !isCheckingMentorshipStatus
            ? {
                  id: 'become-mentor-mobile',
                  label: 'Стать ментором',
                  icon: ShieldQuestion,
              }
            : null;

    const allNavItems = [
        ...commonNavItems.slice(0, 2),
        ...(becomeMentorItem ? [becomeMentorItem] : []),
        ...authNavItems,
        ...commonNavItems.slice(2),
    ].filter(Boolean) as NavItem[];

    return (
        <>
            <Sheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    setIsSheetOpen(open);
                    if (!open) setExpandedSubmenus({});
                }}
            >
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="px-2 lg:hidden block text-primary !outline-0 !ring-0 !border-0"
                        aria-label="Открыть меню"
                    >
                        {isSheetOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full p-4">
                    <SheetTitle>Меню</SheetTitle>
                    <SheetClose>
                        <X size={24} className="text-primary absolute right-6 top-6" />
                    </SheetClose>
                    <nav className="flex flex-col gap-4 mt-4">
                        {allNavItems.map((item, index) => {
                            if (!item) return null;
                            const IconComponent = item.icon as ElementType;
                            return (
                                <motion.div
                                    key={item.id + '-motion'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{
                                        delay: (index + 1) * 0.05,
                                        duration: 0.2,
                                    }}
                                >
                                    {item.id === 'become-mentor-mobile' ? (
                                        <Button
                                            variant={item.variant || 'ghost'}
                                            className={`w-full justify-start ${item.className}`}
                                            size="lg"
                                            onClick={handleBecomeMentorClick}
                                        >
                                            {IconComponent && <IconComponent className="h-4 w-4" />}
                                            {item.label}
                                        </Button>
                                    ) : item.href ? (
                                        <Link href={item.href} onClick={closeSheetAndReset}>
                                            <Button
                                                variant={item.variant || 'ghost'}
                                                className={`w-full justify-start ${item.className}`}
                                                size="lg"
                                            >
                                                {IconComponent && <IconComponent className="h-4 w-4" />}
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant={item.variant || 'ghost'}
                                            className={`w-full justify-start group ${item.className}`}
                                            size="lg"
                                            onClick={() => item.subItems && toggleExpand(item.label)}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    {IconComponent && <IconComponent className="h-4 w-4" />}
                                                    {item.label}
                                                </div>
                                                {item.subItems && (
                                                    <ChevronUp
                                                        size={16}
                                                        className={cn(
                                                            'transition-transform duration-300',
                                                            expandedSubmenus[item.label] && 'rotate-180'
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </Button>
                                    )}

                                    <AnimatePresence>
                                        {item.subItems && expandedSubmenus[item.label] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex flex-col gap-2 pl-4 mt-1"
                                            >
                                                {item.subItems.map((subItem, subIndex) => {
                                                    if (!subItem) return null;

                                                    return (
                                                        <motion.div
                                                            key={subItem.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            transition={{ delay: subIndex * 0.05, duration: 0.2 }}
                                                        >
                                                            <Link
                                                                href={subItem.href || '#'}
                                                                onClick={closeSheetAndReset}
                                                            >
                                                                <Button
                                                                    variant={subItem.variant || 'ghost'}
                                                                    className={`w-full justify-start ${subItem.className}`}
                                                                    size="lg"
                                                                >
                                                                    {renderIcon(subItem.icon)}
                                                                    {subItem.label}
                                                                </Button>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Dialog для модального окна теперь не оборачивает Sheet */}
            <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
                {/* Мы не используем DialogTrigger здесь, так как открываем программно */}
                {isApplicationModalOpen && (
                    <MentorshipApplicationModal
                        onClose={() => setIsApplicationModalOpen(false)}
                        onSuccess={handleApplicationSuccess}
                    />
                )}
            </Dialog>
        </>
    );
};

export default MobileBurgerMenu;
