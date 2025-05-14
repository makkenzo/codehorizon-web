'use client';

import { useEffect, useState } from 'react';

import AchievementsList from '@/components/achievements/achievement-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
            <CardHeader>
                <CardTitle>Мои достижения</CardTitle>
            </CardHeader>
            <CardContent>
                <AchievementsList achievements={achievements} isLoading={isLoadingAchievements} itemsPerRow={2} />
            </CardContent>
        </Card>
    );
};

export default MyAchievements;
