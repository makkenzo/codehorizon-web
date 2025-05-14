import { Achievement } from '@/types';

import { Skeleton } from '../ui/skeleton';
import AchievementItem from './achievement-item';

interface AchievementsListProps {
    achievements: Achievement[] | null | undefined;
    isLoading?: boolean;
    itemsPerRow?: 2 | 3 | 4;
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements, isLoading, itemsPerRow = 2 }) => {
    if (isLoading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-${itemsPerRow} gap-4`}>
                {Array.from({ length: itemsPerRow * 2 }).map((_, index) => (
                    <div
                        key={`skel-ach-${index}`}
                        className="flex flex-col h-full p-4 border rounded-lg shadow-sm bg-card gap-4"
                    >
                        <div className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <Skeleton className="w-10 h-10 rounded-md" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-1/4 mt-2" />
                    </div>
                ))}
            </div>
        );
    }

    if (!achievements || achievements.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-card border rounded-lg">
                <p>Пока нет достижений для отображения.</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-${itemsPerRow} gap-4 md:gap-6`}>
            {achievements.map((ach) => (
                <AchievementItem key={ach.id || ach.key} achievement={ach} />
            ))}
        </div>
    );
};

export default AchievementsList;
