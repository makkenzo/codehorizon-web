'use client';

import React from 'react';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Award, Calendar } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types';

import AchievementIcon from '../reusable/achievement-icon';

interface AchievementsListProps {
    achievements?: Achievement[] | null;
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
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    if (isLoading) {
        return (
            <div className={cn('grid gap-4', gridCols[itemsPerRow])}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex gap-3 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50"
                    >
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
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
                    У вас пока нет достижений. Продолжайте обучение, чтобы получить их!
                </p>
            </div>
        );
    }

    return (
        <div className={cn('grid gap-4', gridCols[itemsPerRow])}>
            {achievements.map((achievement, index) => (
                <motion.div
                    key={achievement.id}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                    className={cn(
                        'group relative overflow-hidden rounded-xl p-4 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#3eccb2]/30 dark:border-[#3eccb2]/20 hover:border-[#3eccb2]/50 dark:hover:border-[#3eccb2]/40 hover:shadow-md'
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3eccb2]/5 to-[hsl(58,83%,62%)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex gap-3 relative z-10">
                        <div
                            className={cn(
                                'flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)]',
                                compact && 'mx-auto'
                            )}
                        >
                            <AchievementIcon
                                iconName={achievement.iconUrl}
                                className={cn('size-6 shrink-0 text-white')}
                            />
                        </div>
                        {!compact && (
                            <div className="flex-1">
                                <h3 className={cn('font-medium mb-1 text-foreground')}>{achievement.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>

                                {achievement.earnedAt && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-[#3eccb2]">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Получено{' '}
                                            {format(new Date(achievement.earnedAt), 'dd MMMM yyyy', { locale: ru })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AchievementsList;
