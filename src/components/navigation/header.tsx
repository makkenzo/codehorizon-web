'use client';

import { HiShoppingCart } from 'react-icons/hi';
import { RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';

import Logo from '@/components/reusable/logo';
import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAuthStore } from '@/stores/auth-store-provider';

import GlobalSearch from '../reusable/global-search';
import { Avatar, AvatarFallback } from '../ui/avatar';

const Header = () => {
    const { accessToken } = useAuthStore((state) => state);

    return (
        <div className="w-full bg-white ">
            <div className="mx-auto flex max-w-[1208px] items-center justify-between py-2 xl:px-0 px-8">
                <div className="flex items-center gap-4">
                    <Logo />
                    <NavigationMenu>
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
                <GlobalSearch className="pt-1" />
                <div className="flex items-center gap-4">
                    <Link href={'/'} className="translate-y-0.5">
                        <Button variant="link" size="link" className="text-foreground">
                            Стать ментором
                        </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="!px-2">
                        <HiShoppingCart className="size-[20px]" />
                    </Button>
                    {accessToken ? (
                        <Avatar>
                            <AvatarFallback>👤</AvatarFallback>
                        </Avatar>
                    ) : (
                        <>
                            <Link href={'/sign-in'}>
                                <Button size="sm" variant="outline">
                                    <span className="font-bold">Войти</span>
                                </Button>
                            </Link>
                            <Link href={'/sign-up'}>
                                <Button size="sm">
                                    <RiProgress5Line />
                                    <span className="font-bold">Зарегистрироваться</span>
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
