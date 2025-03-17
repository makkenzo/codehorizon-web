'use client';

import { ChevronUp } from 'lucide-react';

import Link from 'next/link';

import { NavItem } from '@/types';

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

export const links: NavItem[] = [
    {
        id: 'fc935ed9-0627-5a54-85a1-f8b1621ee9de',
        label: 'Все курсы',
        description: 'Весь список курсов',
        href: '/courses',
    },
    {
        id: 'c8c1158e-265e-5104-85a0-f763c653b83d',
        label: 'Дизайн',
        description: 'Все про дизайн',
        href: '#',
        subItems: [
            {
                id: '88934fc8-3929-57b7-891c-67f28f86cc76',
                label: 'Иллюстрация',
                description: 'Как стать уверенным иллюстратором',
                href: '#',
            },
            {
                id: '86d53986-07f4-5c53-ac58-606da448af5e',
                label: 'Графический дизайн',
                description: 'Извлеките больше пользы из дизайна',
                href: '#',
            },
            {
                id: '5a3ced60-9cc0-5bd4-8542-2d4db9246857',
                label: 'UX/UI Дизайн',
                description: 'Создавайте дизайн для сайтов и приложений',
                href: '#',
            },
        ],
    },
    {
        id: '5fe321ec-a6fd-5e11-8184-3c51204284eb',
        label: 'Программирование',
        description: 'Разработка сайтов и приложений',
        href: '#',
        subItems: [
            {
                id: '0f56d293-513f-57f7-9df8-91280e940022',
                label: 'JavaScript',
                description: 'Основы JavaScript',
                href: '#',
            },
            {
                id: '7fe169d3-43b1-5445-bc22-aeb078e34cdc',
                label: 'TypeScript',
                description: 'Основы TypeScript',
                href: '#',
            },
            {
                id: 'bb07e46d-72b6-58f3-99ac-44f81304eb3f',
                label: 'React',
                description: 'Основы React',
                href: '#',
            },
            {
                id: 'c946cd3d-7b23-568f-a131-87522c479e62',
                label: 'Flutter',
                description: 'Основы Flutter',
                href: '#',
            },
        ],
    },
    {
        id: '1250a571-a6f4-522a-a750-5c56cb366242',
        label: 'Бизнес и маркетинг',
        description: 'Освойте бизнес-решения и привлеките клиентов',
        href: '#',
    },
    {
        id: '66513a54-d497-5254-b552-2a7f226c43b9',
        label: 'Информационные технологии',
        description: 'Создавайте интерактивные и полезные сайты',
        href: '#',
    },
    {
        id: 'dfe02ad7-a57c-594b-a5eb-a0f44be0837a',
        label: 'Фото и видео',
        description: 'Создавайте красивые и полезные медиа для ваших продуктов',
        href: '#',
    },
];

const CatalogDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" className="text-foreground font-normal group lg:flex hidden">
                    <span>Каталог</span>
                    <ChevronUp className="ml-1 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 left-12 after:right-0 after:left-7 after:-z-1" align="start">
                <DropdownMenuGroup>
                    {links.map((category) =>
                        category.subItems ? (
                            <DropdownMenuSub key={category.label}>
                                <DropdownMenuSubTrigger>
                                    <div className="flex flex-col px-3 py-2">
                                        <h2 className="font-medium">{category.label}</h2>
                                        <p className="text-xs text-muted-foreground focus:no-underline">
                                            {category.description}
                                        </p>
                                    </div>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent alignOffset={0} sideOffset={5}>
                                        {category.subItems.map((subCategory) => (
                                            <DropdownMenuItem
                                                key={subCategory.label}
                                                className="py-2 px-3 focus:no-underline group"
                                            >
                                                <div className="flex flex-col gap-0">
                                                    <h2 className="font-medium group-focus:underline">
                                                        {subCategory.label}
                                                    </h2>
                                                    <p className="text-xs text-muted-foreground ">
                                                        {subCategory.description}
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        ) : (
                            <Link key={`${category.label}-${category.label}`} href={category.href || '#'}>
                                <DropdownMenuItem className="group focus:no-underline">
                                    <div className="flex flex-col px-3 py-2 group">
                                        <h2 className="font-medium group-focus:underline">{category.label}</h2>
                                        <p className="text-xs text-muted-foreground">{category.description}</p>
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
