import AchievementIcon from '@/components/reusable/achievement-icon';
import { Achievement } from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AchievementItemProps {
    achievement: Achievement;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement }) => {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 pb-2 pt-4 px-4">
                <AchievementIcon iconName={achievement.iconUrl} className="w-10 h-10 text-primary shrink-0" />
                <CardTitle className="text-md md:text-base font-semibold leading-tight">{achievement.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow px-4 pb-4 pt-0">
                <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                    {achievement.description}
                </CardDescription>
                {achievement.xpBonus > 0 && (
                    <p className="text-xs text-primary font-medium mt-2">+ {achievement.xpBonus} XP</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AchievementItem;
