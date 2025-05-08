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
import { Skeleton } from './ui/skeleton';

const generateLinks = (categories: string[]): NavItem[] => {
    const baseLinks: NavItem[] = [
        {
            id: 'all-courses-static',
            label: 'Все курсы',
            href: '/courses',
            description: 'Весь список курсов',
        },
    ];

    const dynamicLinks: NavItem[] = categories.map((cat, index) => ({
        id: `category-${cat}-${index}`,
        label: cat,
        href: `/courses?category=${encodeURIComponent(cat)}`,
        description: `Курсы по теме ${cat}`,
    }));

    return [...baseLinks, ...dynamicLinks];
};

interface CatalogDropdownProps {
    categories: string[];
    isLoading?: boolean;
}

const CatalogDropdown = ({ categories, isLoading }: CatalogDropdownProps) => {
    const linksToRender = generateLinks(categories);

    if (isLoading) {
        return <Skeleton className="h-9 w-24 rounded-md" />;
    }

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
                    {linksToRender.map((category) =>
                        category && category.subItems ? (
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
                                        {category.subItems.map((subCategory) => {
                                            if (!subCategory) return null;
                                            return (
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
                                            );
                                        })}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        ) : (
                            <Link
                                key={`${category?.label ?? 'category'}-${category?.label ?? 'label'}`}
                                href={category?.href || '#'}
                            >
                                <DropdownMenuItem className="group focus:no-underline">
                                    <div className="flex flex-col px-3 py-2 group">
                                        <h2 className="font-medium group-focus:underline">{category?.label}</h2>
                                        <p className="text-xs text-muted-foreground">{category?.description}</p>
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
