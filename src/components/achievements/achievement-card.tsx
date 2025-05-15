'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle, Star } from 'lucide-react';

import AchievementIcon from '@/components/reusable/achievement-icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GlobalAchievementDTO } from '@/types';

interface AchievementCardProps {
    achievement: GlobalAchievementDTO;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const { name, description, iconUrl, xpBonus, isEarnedByUser, earnedAt, category } = achievement;

    const earnedDateFormatted = earnedAt
        ? new Date(earnedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;

    return (
        <Card
            className={cn(
                'flex flex-col h-full overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg',
                isEarnedByUser
                    ? 'bg-primary/5 border-primary/40 hover:border-primary/60'
                    : 'bg-card/70 dark:bg-background/70 border-border/20 hover:border-border/40',
                'backdrop-blur-sm rounded-xl'
            )}
        >
            <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex-shrink-0 p-2.5 rounded-full border',
                            isEarnedByUser
                                ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50'
                                : 'bg-muted/40 dark:bg-muted/10 border-border/30'
                        )}
                    >
                        <AchievementIcon
                            iconName={iconUrl}
                            className={cn('size-6', isEarnedByUser ? 'text-primary' : 'text-muted-foreground')}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle
                            className={cn(
                                'text-base font-semibold line-clamp-2',
                                isEarnedByUser ? 'text-primary' : 'text-foreground'
                            )}
                        >
                            {name}
                        </CardTitle>
                        {category && (
                            <Badge
                                variant={isEarnedByUser ? 'default' : 'secondary'}
                                className={cn(
                                    'text-[10px] px-1.5 py-0 mt-0.5 font-normal leading-tight',
                                    isEarnedByUser && 'bg-primary/20 text-primary border-primary/30'
                                )}
                            >
                                {category}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow px-4 pb-3 space-y-1.5">
                <p className="text-xs text-muted-foreground line-clamp-3 min-h-[42px]">{description}</p>{' '}
                {isEarnedByUser && earnedDateFormatted && (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center text-[10px] text-primary/90 cursor-default">
                                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                Получено: {earnedDateFormatted}
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>
                                    Достижение получено{' '}
                                    {new Date(earnedAt!).toLocaleString('ru-RU', {
                                        dateStyle: 'long',
                                        timeStyle: 'short',
                                    })}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </CardContent>
            <CardFooter className="px-4 py-2.5 border-t border-border/10 dark:border-border/20">
                <Badge
                    variant={isEarnedByUser ? 'default' : 'secondary'}
                    className={cn(
                        'text-xs',
                        isEarnedByUser && 'bg-primary/80 text-primary-foreground shadow-sm',
                        !isEarnedByUser && 'bg-muted text-muted-foreground'
                    )}
                >
                    <Star className="mr-1 h-3 w-3" />
                    {xpBonus} XP
                </Badge>
            </CardFooter>
        </Card>
    );
};

export default AchievementCard;
