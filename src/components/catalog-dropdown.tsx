'use client';

import { ChevronUp } from 'lucide-react';

import Link from 'next/link';

import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const links = [
    {
        label: 'Все курсы',
        description: 'Весь список курсов',
        href: '/courses',
    },
    {
        label: 'Дизайн',
        description: 'Все про дизайн',
        href: '#',
        sub: [
            {
                label: 'Иллюстрация',
                description: 'Как стать уверенным иллюстратором',
                href: '#',
            },
            {
                label: 'Графический дизайн',
                description: 'Извлеките больше пользы из дизайна',
                href: '#',
            },
            {
                label: 'UX/UI Дизайн',
                description: 'Создавайте дизайн для сайтов и приложений',
                href: '#',
            },
        ],
    },
    {
        label: 'Программирование',
        description: 'Разработка сайтов и приложений',
        href: '#',
        sub: [
            {
                label: 'JavaScript',
                description: 'Основы JavaScript',
                href: '#',
            },
            {
                label: 'TypeScript',
                description: 'Основы TypeScript',
                href: '#',
            },
            {
                label: 'React',
                description: 'Основы React',
                href: '#',
            },
            {
                label: 'Flutter',
                description: 'Основы Flutter',
                href: '#',
            },
        ],
    },
    {
        label: 'Бизнес и маркетинг',
        description: 'Освойте бизнес-решения и привлеките клиентов',
        href: '#',
    },
    {
        label: 'Информационные технологии',
        description: 'Создавайте интерактивные и полезные сайты',
        href: '#',
    },
    {
        label: 'Фото и видео',
        description: 'Создавайте красивые и полезные медиа для ваших продуктов',
        href: '#',
    },
];

const CatalogDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="link"
                    className="text-foreground font-normal group"
                >
                    <span>Каталог</span>
                    <ChevronUp className="ml-1 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-72 left-12 after:right-0 after:left-7 after:-z-1"
                align="start"
            >
                <DropdownMenuGroup>
                    {links.map((category) =>
                        category.sub ? (
                            <DropdownMenuSub key={category.label}>
                                <DropdownMenuSubTrigger>
                                    <div className="flex flex-col px-3 py-2">
                                        <h2 className="font-medium">
                                            {category.label}
                                        </h2>
                                        <p className="text-xs text-muted-foreground focus:no-underline">
                                            {category.description}
                                        </p>
                                    </div>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                        alignOffset={0}
                                        sideOffset={5}
                                    >
                                        {category.sub.map((subCategory) => (
                                            <DropdownMenuItem
                                                key={subCategory.label}
                                                className="py-2 px-3 focus:no-underline group"
                                            >
                                                <div className="flex flex-col gap-0">
                                                    <h2 className="font-medium group-focus:underline">
                                                        {subCategory.label}
                                                    </h2>
                                                    <p className="text-xs text-muted-foreground ">
                                                        {
                                                            subCategory.description
                                                        }
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        ) : (
                            <Link
                                key={`${category.label}-${category.label}`}
                                href={category.href}
                            >
                                <DropdownMenuItem className="group focus:no-underline">
                                    <div className="flex flex-col px-3 py-2 group">
                                        <h2 className="font-medium group-focus:underline">
                                            {category.label}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            </Link>
                        )
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CatalogDropdown;

