import { Fragment, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Book, ChevronDown, ChevronUp, Heart, Home, Menu, Settings, ShoppingBag, X } from 'lucide-react';
import { RiProfileFill, RiProfileLine, RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Profile } from '@/models';
import { NavItem } from '@/types';

import { links } from '../catalog-dropdown';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';

interface MobileBurgerMenuProps {
    profile?: Profile;
}

const MobileBurgerMenu = ({ profile }: MobileBurgerMenuProps) => {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    const toggleExpand = (label: string) => {
        setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const commonNavItems: NavItem[] = [
        {
            id: '54440642-cc40-5b73-96f1-a9e67bf0884f',
            href: '/',
            label: 'Главная',
            icon: <Home />,
        },
        {
            id: '3c4af7c0-5a5c-5432-9b2c-a6606a0df7be',
            label: 'Каталог',
            icon: <Book />,
            href: '/courses',
        },
        {
            id: '2c5bf575-c80b-571f-a0e5-3a5a53e3e28a',
            href: '/',
            label: 'Корзина',
            icon: <ShoppingBag />,
        },
        {
            id: '53ca9885-ba7a-5957-a305-7697cd654dda',
            href: '/me/courses?tab=wishlist',
            label: 'Список желаемого',
            icon: <Heart />,
        },
    ];

    const authNavItems: NavItem[] = profile
        ? [
              {
                  id: '02fac1a0-9fbc-530a-8507-d6c52d54cb69',
                  label: 'Личный кабинет',
                  icon: <RiProfileFill />,
                  className: 'text-primary',
                  subItems: [
                      {
                          id: '62be7feb-62f2-5fea-b4ff-a5022d48dbfc',
                          href: '/me/profile',
                          label: 'Профиль',
                          icon: <RiProfileLine />,
                          className: 'text-primary',
                      },
                      {
                          id: 'cb5283a9-cf5a-544d-940a-765e6a3190e0',
                          href: '/',
                          label: 'Уведомления',
                          icon: <Bell />,
                          className: 'text-primary',
                      },
                      {
                          id: '7fb21855-e088-5ee6-8a39-29afddbf10ea',
                          href: '/',
                          label: 'Настройки аккаунта',
                          icon: <Settings />,
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
                  icon: <RiProgress5Line />,
                  className: 'text-primary',
              },
              {
                  id: '486367d2-e2a0-521c-a4ca-8c050977873d',
                  href: '/sign-up',
                  label: 'Регистрация',
                  icon: <RiProgress5Line />,
                  className: 'text-primary',
              },
          ];

    const allNavItems = [...commonNavItems.slice(0, 2), ...authNavItems, ...commonNavItems.slice(2)];

    return (
        <Sheet
            open={open}
            onOpenChange={(open) => {
                setOpen(open);
                setExpanded({});
            }}
        >
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="px-2 lg:hidden block text-primary !outline-0 !ring-0 !border-0"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-4">
                <SheetTitle>Меню</SheetTitle>

                <nav className="flex flex-col gap-4">
                    {allNavItems.map((item, index) => (
                        <Fragment key={item.id}>
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{
                                    delay: (index + 1) * 0.1,
                                    duration: 0.3,
                                }}
                            >
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        onClick={() => {
                                            setOpen(false);
                                            setExpanded({});
                                        }}
                                    >
                                        <Button
                                            variant={item.variant || 'ghost'}
                                            className={`w-full justify-start ${item.className}`}
                                            size="lg"
                                        >
                                            {item.icon}
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
                                                {item.icon}
                                                {item.label}
                                            </div>
                                            {item.subItems && (
                                                <ChevronUp
                                                    size={16}
                                                    className={cn(
                                                        'transition-transform duration-300',
                                                        expanded[item.label] && 'rotate-180'
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </Button>
                                )}
                            </motion.div>
                            <AnimatePresence>
                                {item.subItems && expanded[item.label] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col gap-4"
                                    >
                                        {item.subItems.map((subItem, subIndex) => (
                                            <motion.div
                                                key={subItem.id}
                                                initial={{
                                                    opacity: 0,
                                                    x: -20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    x: -20,
                                                }}
                                                transition={{
                                                    delay: subIndex * 0.1,
                                                    duration: 0.3,
                                                }}
                                            >
                                                <Link
                                                    href={subItem.href || '#'}
                                                    onClick={() => {
                                                        setOpen(false);
                                                        setExpanded({});
                                                    }}
                                                >
                                                    <Button
                                                        variant={subItem.variant || 'ghost'}
                                                        className={`w-full justify-start ${subItem.className}`}
                                                        size="lg"
                                                    >
                                                        - {subItem.icon}
                                                        {subItem.label}
                                                    </Button>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Fragment>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
};

export default MobileBurgerMenu;
