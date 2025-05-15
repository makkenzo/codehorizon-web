'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

import AchievementsList from '@/components/achievements/achievement-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/stores/user/user-store-provider';

interface MyAchievementsProps {}

const MyAchievements = ({}: MyAchievementsProps) => {
    const { achievements, fetchUserAchievements } = useUserStore((state) => ({
        achievements: state.achievements,
        fetchUserAchievements: state.fetchUserAchievements,
    }));
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

    useEffect(() => {
        if (achievements === undefined) {
            setIsLoadingAchievements(true);
            fetchUserAchievements().finally(() => setIsLoadingAchievements(false));
        } else {
            setIsLoadingAchievements(false);
        }
    }, [achievements, fetchUserAchievements]);

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3eccb2]/5 via-[hsl(58,83%,62%)]/5 to-[hsl(173,58%,39%)]/5 opacity-50"></div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Мои достижения
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {isLoadingAchievements ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: {
                                                staggerChildren: 0.1,
                                            },
                                        },
                                    }}
                                >
                                    <AchievementsList
                                        achievements={achievements}
                                        isLoading={isLoadingAchievements}
                                        itemsPerRow={2}
                                    />
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default MyAchievements;
