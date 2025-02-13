import { HiShoppingCart } from 'react-icons/hi';
import { RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';

import Logo from '@/components/reusable/logo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderProps {}

const Header = ({}: HeaderProps) => {
    return (
        <div className="w-full bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between py-2">
                <div className="flex items-center gap-4">
                    <Logo />
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Каталог" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={'/'}>
                        <Button variant="link" size="link" className="text-foreground">
                            Стать ментором
                        </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="!px-2">
                        <HiShoppingCart className="size-[20px]" />
                    </Button>
                    <Button size="sm" variant="outline">
                        <span className="font-bold">Войти</span>
                    </Button>
                    <Button size="sm">
                        <RiProgress5Line />
                        <span className="font-bold">Зарегистрироваться</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Header;
