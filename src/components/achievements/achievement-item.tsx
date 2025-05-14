import AchievementIcon from '@/components/reusable/achievement-icon';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AchievementItemProps {
    achievement: Achievement;
    compact?: boolean;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, compact = false }) => {
    return (
        <Card className="flex flex-col h-full py-0">
            <CardHeader className={cn('flex flex-row items-center gap-x-4 space-y-0 pt-4 px-4', !compact && 'pb-2')}>
                <AchievementIcon
                    iconName={achievement.iconUrl}
                    className={cn('w-10 h-10 text-primary shrink-0', compact && 'mx-auto')}
                />
                {!compact ? (
                    <CardTitle className="text-md md:text-base font-semibold leading-tight">
                        {achievement.name}
                    </CardTitle>
                ) : null}
            </CardHeader>
            <CardContent className={cn('flex-grow px-4 pt-0', !compact && 'pb-4', compact && 'text-center')}>
                {!compact ? (
                    <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                        {achievement.description}
                    </CardDescription>
                ) : null}
                {achievement.xpBonus > 0 && !compact && (
                    <p className="text-xs text-primary font-medium mt-2">+ {achievement.xpBonus} XP</p>
                )}
                {compact ? <span className="text-xs text-center w-fit">{achievement.name}</span> : null}
            </CardContent>
        </Card>
    );
};

export default AchievementItem;
