'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

import type { PopularAuthorDTO } from '@/types';

import AuthorCard from '../author/author-card';
import { Skeleton } from '../ui/skeleton';

interface PopularMentorsSectionProps {
    initialAuthors?: PopularAuthorDTO[] | null;
    isLoading?: boolean;
}

export default function PopularMentors({ initialAuthors, isLoading = false }: PopularMentorsSectionProps) {
    if (isLoading) {
        return (
            <section className="space-y-4 md:space-y-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background rounded-lg opacity-50"></div>
                <Skeleton className="h-7 w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={`skeleton-mentor-${i}`} className="flex flex-col relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Skeleton className="h-56 w-full rounded-lg" />
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
            className="space-y-4 md:space-y-6 relative"
        >
            <div className="absolute -inset-4 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/90 rounded-xl"></div>
                <motion.div
                    className="absolute top-1/4 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                    }}
                />

                <motion.div
                    className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-secondary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                        delay: 2,
                    }}
                />

                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/5)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            </div>

            <div className="flex items-center justify-between relative">
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 12 * 0.1, duration: 0.4 }}
                >
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="p-1.5 rounded-md bg-primary/10 text-primary"
                    >
                        <Users className="h-5 w-5" />
                    </motion.div>
                    <h2 className="text-xl md:text-2xl font-bold">Популярные менторы</h2>
                </motion.div>

                <motion.div
                    className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ delay: 13 * 0.1, duration: 0.8 }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative">
                {initialAuthors.map((author, index) => (
                    <motion.div
                        key={author.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (14 + index) * 0.1, duration: 0.4 }}
                    >
                        <AuthorCard author={author} />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
