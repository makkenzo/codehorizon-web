'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, Award, Trophy } from 'lucide-react';

import Link from 'next/link';

import AchievementItem from '@/components/achievements/achievement-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/stores/user/user-store-provider';
import { GlobalAchievementDTO } from '@/types';

const MyAchievements = () => {
    const { earnedAchievements, fetchUserEarnedAchievements } = useUserStore((state) => ({
        earnedAchievements: state.earnedAchievements,
        fetchUserEarnedAchievements: state.fetchUserEarnedAchievements,
    }));
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

    useEffect(() => {
        if (earnedAchievements === undefined) {
            setIsLoadingAchievements(true);
            fetchUserEarnedAchievements().finally(() => setIsLoadingAchievements(false));
        } else {
            setIsLoadingAchievements(false);
        }
    }, [earnedAchievements, fetchUserEarnedAchievements]);

    const achievementsForCard: GlobalAchievementDTO[] | undefined | null = earnedAchievements?.map((ach) => ({
        ...ach,
        isEarnedByUser: true,
        earnedAt: ach.earnedAt || new Date().toISOString(),
        category: ach.category || undefined,
        iconUrl: ach.iconUrl || null,
        xpBonus: ach.xpBonus || 0,
        order: ach.order || 0,
    }));

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="p-0 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3eccb2]/5 via-[hsl(58,83%,62%)]/5 to-[hsl(173,58%,39%)]/5 opacity-50"></div>
                        <CardHeader className="relative z-10 flex justify-between items-center">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Мои достижения
                                </span>
                            </CardTitle>
                            <div className="text-center">
                                <Link href="/achievements">
                                    <Button variant="link">
                                        Посмотреть все достижения
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {isLoadingAchievements ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col h-full bg-card/70 dark:bg-background/70 backdrop-blur-sm border border-border/20 shadow-sm rounded-xl p-4 space-y-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full bg-muted/70 dark:bg-muted/20" />
                                                <div className="flex-1 space-y-1.5">
                                                    <Skeleton className="h-5 w-3/4 rounded bg-muted/70 dark:bg-muted/20" />
                                                    <Skeleton className="h-3 w-1/2 rounded bg-muted/70 dark:bg-muted/20" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-3 w-full rounded bg-muted/70 dark:bg-muted/20" />
                                            <Skeleton className="h-3 w-5/6 rounded bg-muted/70 dark:bg-muted/20" />
                                            <div className="pt-2 mt-auto border-t border-border/10 dark:border-border/20">
                                                <Skeleton className="h-5 w-1/3 rounded bg-muted/70 dark:bg-muted/20 mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : achievementsForCard && achievementsForCard.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {achievementsForCard.map((achievement, index) => (
                                        <motion.div
                                            key={achievement.id || `my-ach-${index}`}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <AchievementItem achievement={achievement} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 rounded-xl bg-transparent">
                                    <Award className="h-12 w-12 mx-auto text-[#3eccb2]/50 mb-3" />
                                    <p className="text-muted-foreground">
                                        У вас пока нет достижений. Продолжайте обучение, чтобы получить их!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default MyAchievements;
