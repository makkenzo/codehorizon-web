'use client';

import { useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { FaUserSecret } from 'react-icons/fa6';
import { RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from '@/components/reusable/logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { heroFadeInVariants } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import AuthApiClient from '@/server/auth';
import CoursesApiClient from '@/server/courses';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

import CatalogDropdown from '../catalog-dropdown';
import CatalogFiltersMobile from '../catalog/filters-mobile';
import GlobalSearch from '../reusable/global-search';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import MobileBurgerMenu from './mobile-burger-menu';

const Header = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const { isAuthenticated, isPending } = useAuth();
    const pathname = usePathname();

    const { profile, clearProfile } = useProfileStore((state) => state);

    const { user, clearUser } = useUserStore((state) => state);

    useEffect(() => {
        const apiClient = new CoursesApiClient();
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const fetched = await apiClient.getCategories();
                setCategories(fetched ?? []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className={cn('w-full', pathname !== '/' && 'bg-white')}>
            <div className="mx-auto flex max-w-[1208px] items-center justify-between py-2 xl:px-0 px-4">
                {isPending ? (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-[40px] w-[40px] rounded-full" />
                                <Skeleton className="h-[28px] w-[120px]" />
                            </div>
                            <Skeleton className="h-[36px] w-[100px]" />
                        </div>
                        <Skeleton className="h-[37px] w-[400px]" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-[22px] w-[108px]" />
                            <Skeleton className="size-[38px]" />
                            <Skeleton className="h-[32px] w-[65px]" />
                            <Skeleton className="h-[32px] w-[196px]" />
                        </div>
                    </>
                ) : (
                    <motion.div
                        variants={heroFadeInVariants}
                        animate="visible"
                        initial="hidden"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex w-full"
                    >
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex items-center gap-2">
                                <MobileBurgerMenu profile={profile} />
                                <Logo />
                            </div>
                            <CatalogDropdown categories={categories} isLoading={isLoadingCategories} />
                        </div>
                        <GlobalSearch className="pt-1 lg:block hidden" />
                        <div className="flex items-center gap-4 w-full justify-end">
                            {isAuthenticated &&
                                !(user?.roles?.includes('MENTOR') || user?.roles?.includes('ROLE_MENTOR')) && (
                                    <Button
                                        variant="link"
                                        size="link"
                                        className="text-foreground lg:block hidden translate-y-0.5"
                                        onClick={() => alert('Чтобы стать ментором, обратитесь к администрации.')}
                                    >
                                        Стать ментором
                                    </Button>
                                )}
                            {pathname.includes('courses') ? <CatalogFiltersMobile /> : null}
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="hover:cursor-pointer lg:block hidden hover:outline-4 outline-primary outline-0 ease-in-out transition-all duration-100">
                                            {profile?.avatarUrl && <AvatarImage src={profile?.avatarUrl} />}
                                            <AvatarFallback>
                                                <FaUserSecret />
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                                        <DropdownMenuLabel className="pb-0 pl-0">
                                            {profile && profile.firstName && profile.lastName
                                                ? profile.firstName + ' ' + profile.lastName
                                                : 'Мой Аккаунт'}
                                        </DropdownMenuLabel>
                                        <DropdownMenuLabel className="font-normal pt-0 pl-0">
                                            {user?.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <Link href="/me/profile">
                                                <DropdownMenuItem>Профиль</DropdownMenuItem>
                                            </Link>
                                            <Link href="/me/courses">
                                                <DropdownMenuItem>Мои курсы</DropdownMenuItem>
                                            </Link>
                                            <Link href="/me/courses?tab=wishlist">
                                                <DropdownMenuItem>Список желаемого</DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        {(user?.roles?.includes('MENTOR') ||
                                            user?.roles?.includes('ROLE_MENTOR') ||
                                            user?.roles?.includes('ADMIN') ||
                                            user?.roles?.includes('ROLE_ADMIN')) && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <Link href="/admin">
                                                        <DropdownMenuItem className="text-accent focus:text-accent cursor-pointer">
                                                            Админ-панель
                                                        </DropdownMenuItem>
                                                    </Link>
                                                </DropdownMenuGroup>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>
                                                <span>Уведомления</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <span>Настройки аккаунта</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={async () => {
                                                clearProfile();
                                                clearUser();

                                                await new AuthApiClient().isLoggedOut();

                                                window.location.reload();
                                            }}
                                        >
                                            <span>Выйти</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Link
                                        href={`/sign-in?from=${encodeURIComponent(pathname)}`}
                                        className="lg:block hidden"
                                    >
                                        <Button size="sm" variant="outline">
                                            <span className="font-bold">Войти</span>
                                        </Button>
                                    </Link>
                                    <Link href={'/sign-up'} className="lg:block hidden">
                                        <Button size="sm">
                                            <RiProgress5Line />
                                            <span className="font-bold">Зарегистрироваться</span>
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Header;
