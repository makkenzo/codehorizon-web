import { Sparkles } from 'lucide-react';

import AchievementIcon from '@/components/reusable/achievement-icon';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AchievementItemProps {
    achievement: Achievement;
    compact?: boolean;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, compact = false }) => {
    const getGradient = () => {
        const hash = achievement.name.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const hue1 = Math.abs(hash % 360);
        const hue2 = (hue1 + 40) % 360;

        return {
            primary: `hsl(${hue1}, 80%, 60%)`,
            secondary: `hsl(${hue2}, 80%, 50%)`,
        };
    };

    const { primary, secondary } = getGradient();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Card
                        className={cn(
                            'flex flex-col h-full overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105',
                            'bg-gradient-to-br relative',
                            compact ? 'py-2' : 'py-0'
                        )}
                        style={{
                            background: `linear-gradient(135deg, ${primary}15, ${secondary}30)`,
                            borderImage: `linear-gradient(135deg, ${primary}, ${secondary}) 1`,
                            borderWidth: '2px',
                            borderStyle: 'solid',
                        }}
                    >
                        <div className="absolute top-1 right-1 text-primary opacity-70">
                            <Sparkles size={16} />
                        </div>
                        <CardHeader
                            className={cn(
                                'flex space-y-0 pt-4 px-4',
                                compact ? 'flex-col items-center' : 'flex-row items-center gap-x-4',
                                !compact && 'pb-2'
                            )}
                        >
                            <div
                                className="relative p-2 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${primary}30, ${secondary}50)`,
                                    boxShadow: `0 0 10px ${primary}50`,
                                }}
                            >
                                <AchievementIcon
                                    iconName={achievement.iconUrl}
                                    className={cn('w-10 h-10 shrink-0', compact && 'mx-auto')}
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}30, ${secondary}50)`,
                                        color: primary,
                                        fontWeight: 'bold',
                                    }}
                                />
                            </div>
                            {!compact ? (
                                <CardTitle className="text-md md:text-base font-semibold leading-tight">
                                    {achievement.name}
                                </CardTitle>
                            ) : null}
                        </CardHeader>
                        <CardContent
                            className={cn('flex-grow px-4 pt-0', !compact && 'pb-4', compact && 'text-center')}
                        >
                            {!compact ? (
                                <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                                    {achievement.description}
                                </CardDescription>
                            ) : null}
                            {achievement.xpBonus > 0 && !compact && (
                                <div
                                    className="text-xs font-medium mt-2 px-2 py-1 rounded-full w-fit"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}30, ${secondary}50)`,
                                        color: primary,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    + {achievement.xpBonus} XP
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                {compact ? <TooltipContent>{achievement.name}</TooltipContent> : null}
            </Tooltip>
        </TooltipProvider>
    );
};

export default AchievementItem;
