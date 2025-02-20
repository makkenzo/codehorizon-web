'use client';

import { FaUserSecret } from 'react-icons/fa6';
import { HiShoppingCart } from 'react-icons/hi';
import { RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';

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
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import AuthApiClient from '@/server/auth';
import { useAuthStore } from '@/stores/auth/auth-store-provider';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

import GlobalSearch from '../reusable/global-search';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import MobileBurgerMenu from './mobile-burger-menu';

const Header = () => {
    const hasHydrated = useHasHydrated();
    const { profile, clearProfile } = useProfileStore((state) => state);
    const { user, clearUser } = useUserStore((state) => state);
    const { clearTokens } = useAuthStore((state) => state);

    return (
        <div className="w-full bg-white">
            <div className="mx-auto flex max-w-[1208px] items-center justify-between py-2 xl:px-0 px-4">
                {!hasHydrated ? (
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
                    <>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <MobileBurgerMenu profile={profile} />
                                <Logo />
                            </div>
                            <NavigationMenu className="lg:block hidden">
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Каталог</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <NavigationMenuLink>Ссылочка</NavigationMenuLink>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                        <GlobalSearch className="pt-1 lg:block hidden" />
                        <div className="flex items-center gap-4">
                            <Link href={'/'} className="translate-y-0.5 lg:block hidden">
                                <Button variant="link" size="link" className="text-foreground">
                                    Стать ментором
                                </Button>
                            </Link>
                            <Button size="sm" variant="ghost" className="!px-2">
                                <HiShoppingCart className="size-[20px]" />
                            </Button>
                            {profile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="hover:cursor-pointer lg:block hidden hover:outline-4 outline-primary outline-0 ease-in-out transition-all duration-100">
                                            <AvatarFallback>
                                                <FaUserSecret />
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <DropdownMenuLabel className="pb-0">
                                            {profile.firstName && profile.lastName
                                                ? profile.firstName + ' ' + profile.lastName
                                                : 'Мой Аккаунт'}
                                        </DropdownMenuLabel>
                                        <DropdownMenuLabel className="font-normal pt-0">
                                            {user?.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>
                                                <span>Профиль</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <span>Моя корзина</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <span>Список желаемого</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
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
                                                clearTokens();
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
                                    <Link href={'/sign-in'} className="lg:block hidden">
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Header;
