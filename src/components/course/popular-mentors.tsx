'use client';

import { motion } from 'framer-motion';

import { PopularAuthorDTO } from '@/types';

import AuthorCard from '../author/author-card';
import { Skeleton } from '../ui/skeleton';

interface PopularMentorsSectionProps {
    initialAuthors?: PopularAuthorDTO[] | null;
    isLoading?: boolean;
}

export default function PopularMentors({ initialAuthors, isLoading = false }: PopularMentorsSectionProps) {
    if (isLoading) {
        return (
            <section className="space-y-4 md:space-y-6">
                <Skeleton className="h-7 w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={`skeleton-mentor-${i}`} className="flex flex-col">
                            <Skeleton className="h-24 w-full rounded-t-lg" />
                            <Skeleton className="h-32 w-full rounded-b-lg pt-12 p-4 space-y-2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!initialAuthors || initialAuthors.length === 0) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 11 * 0.1, duration: 0.3 }}
            className="space-y-4 md:space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold">Популярные менторы</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {initialAuthors.map((author) => (
                    <AuthorCard key={author.userId} author={author} />
                ))}
            </div>
        </motion.section>
    );
}
