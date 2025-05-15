'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GlobalAchievementDTO } from '@/types';

import AchievementItem from './achievement-item';

interface AchievementsListProps {
    achievements?: GlobalAchievementDTO[] | null;
    isLoading?: boolean;
    itemsPerRow?: 1 | 2 | 3 | 4;
    compact?: boolean;
}

const AchievementsList = ({
    achievements = [],
    isLoading = false,
    itemsPerRow = 3,
    compact = false,
}: AchievementsListProps) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    if (isLoading) {
        return (
            <div className={cn('grid gap-4 md:gap-5', gridCols[itemsPerRow])}>
                {Array.from({ length: compact ? itemsPerRow * 2 : 6 }).map((_, index) => (
                    <div
                        key={`skeleton-list-${index}`}
                        className="flex flex-col h-full bg-card/70 dark:bg-background/70 backdrop-blur-sm border border-border/20 shadow-sm rounded-xl p-4 space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <Skeleton
                                className={cn(
                                    'rounded-lg flex-shrink-0',
                                    compact ? 'h-10 w-10 p-2' : 'h-12 w-12 p-2.5'
                                )}
                            />
                            {!compact && (
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-5 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            )}
                            {compact && <Skeleton className="h-4 w-12 rounded ml-1" />}
                        </div>
                        {!compact && (
                            <>
                                <Skeleton className="h-3 w-full rounded" />
                                <Skeleton className="h-3 w-5/6 rounded" />
                            </>
                        )}
                        <div
                            className={cn(
                                'pt-2 mt-auto border-t border-border/10 dark:border-border/20',
                                compact && 'flex justify-center'
                            )}
                        >
                            <Skeleton className="h-5 w-1/3 rounded mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!achievements?.length) {
        return (
            <div className="text-center py-8 px-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30">
                <Award className="h-12 w-12 mx-auto text-[#3eccb2]/50 mb-3" />
                <p className="text-muted-foreground">
                    {compact
                        ? 'Достижений пока нет.'
                        : 'У вас пока нет достижений. Продолжайте обучение, чтобы получить их!'}
                </p>
            </div>
        );
    }

    return (
        <div className={cn('grid gap-4 md:gap-5', gridCols[itemsPerRow])}>
            {achievements.map((achievement, index) => (
                <motion.div
                    key={achievement.id || `ach-list-item-${index}`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <AchievementItem achievement={achievement} compact={compact} />
                </motion.div>
            ))}
        </div>
    );
};

export default AchievementsList;
