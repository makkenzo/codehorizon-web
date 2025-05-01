'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface CategoryRowSelectProps {
    categories: string[];
}

const CategoryRowSelect = ({ categories }: CategoryRowSelectProps) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const allCategories = ['Все курсы', ...categories];

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="flex gap-2 items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 * 0.1, duration: 0.3 }}
        >
            {allCategories.map((category, index) => {
                const isActive = activeCategory === category || (category === 'Все курсы' && activeCategory === null);
                const href =
                    category === 'Все курсы' ? '/courses' : `/courses?category=${encodeURIComponent(category)}`;

                return (
                    <Link href={href} key={category} scroll={false}>
                        <Button
                            variant="outline"
                            className={cn(
                                'border-border/40 hover:border-primary hover:text-primary hover:bg-primary/5 text-foreground/70 font-medium px-4 whitespace-nowrap shrink-0', // Добавили whitespace-nowrap и shrink-0
                                isActive && 'border-primary text-primary bg-primary/10'
                            )}
                            size="sm"
                            data-active={isActive}
                        >
                            {category}
                        </Button>
                    </Link>
                );
            })}
        </motion.div>
    );
};

export default CategoryRowSelect;
