import { Flame } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface LevelProgressProps {
    level: number;
    currentXp: number;
    xpForNextLevel: number;
    dailyStreak?: number;
    className?: string;
    showTooltip?: boolean;
    showLevel?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
    level,
    currentXp,
    xpForNextLevel,
    dailyStreak,
    className,
    showTooltip = true,
    showLevel = true,
}) => {
    const safeXpForNextLevel = xpForNextLevel > 0 ? xpForNextLevel : 100;
    const safeCurrentXp = Math.min(currentXp, safeXpForNextLevel);
    const progressPercentage = (safeCurrentXp / safeXpForNextLevel) * 100;

    const xpToNext = Math.max(0, xpForNextLevel - currentXp);

    const content = (
        <div className={cn('flex items-center gap-2 text-sm', className)}>
            <div className="flex items-center">
                <span className="font-semibold mr-1.5">Ур. {level}</span>
                <Progress value={progressPercentage} className="w-16 md:w-20 h-1.5" />
            </div>
        </div>
    );

    if (!showTooltip) {
        return content;
    }

    return (
        <div className="flex items-center gap-2">
            {dailyStreak !== undefined && dailyStreak > 0 && (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center text-orange-500 cursor-default">
                                <Flame className="size-4 mr-0.5" />
                                <span>{dailyStreak}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Дней подряд: {dailyStreak}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {showLevel && (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>
                                Опыт: {currentXp} / {xpForNextLevel}
                            </p>
                            {xpToNext > 0 ? (
                                <p>До след. уровня: {xpToNext} XP</p>
                            ) : (
                                <p>Максимальный уровень достигнут или данные обновляются!</p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};

export default LevelProgress;
