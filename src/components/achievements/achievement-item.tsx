'use client';

import { useState } from 'react';

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
    const [isHovered, setIsHovered] = useState(false);

    const getGradient = () => {
        const hash = achievement.name.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const hue1 = Math.abs(hash % 360);
        const hue2 = (hue1 + 60) % 360;

        return {
            primary: `hsl(${hue1}, 90%, 55%)`,
            secondary: `hsl(${hue2}, 90%, 45%)`,
            text: `hsl(${hue1}, 90%, 35%)`,
        };
    };

    const { primary, secondary, text } = getGradient();

    const cardContent = (
        <Card
            className={cn(
                'flex flex-col h-full overflow-hidden transition-all duration-300 rounded-none',
                'relative group',
                compact ? 'py-2' : 'py-0',
                isHovered && 'scale-[1.02]'
            )}
            style={{
                background: `linear-gradient(135deg, ${primary}20, ${secondary}40)`,
                borderImage: `linear-gradient(135deg, ${primary}, ${secondary}) 1`,
                borderWidth: '2px',
                borderStyle: 'solid',
                boxShadow: isHovered ? `0 10px 25px -5px ${primary}40` : `0 5px 15px -5px ${primary}30`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="absolute inset-0 opacity-20 z-0"
                style={{
                    background: `radial-gradient(circle at top right, ${primary}, transparent 70%)`,
                }}
            />

            <div
                className={cn(
                    'absolute top-1 right-1 opacity-70 transition-all duration-300',
                    isHovered ? 'text-white scale-110' : `text-[${primary}]`
                )}
            >
                <Sparkles size={16} />
            </div>

            <CardHeader
                className={cn(
                    'flex space-y-0 pt-4 px-4 z-10',
                    compact ? 'flex-col items-center' : 'flex-row items-center gap-x-4',
                    !compact && 'pb-2'
                )}
            >
                <div
                    className={cn('relative p-3 rounded-full transition-all duration-300', isHovered && 'scale-110')}
                    style={{
                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                        boxShadow: isHovered
                            ? `0 0 15px ${primary}70, 0 0 5px ${secondary}50 inset`
                            : `0 0 10px ${primary}50`,
                    }}
                >
                    <AchievementIcon
                        iconName={achievement.iconUrl}
                        className={cn('w-8 h-8 shrink-0 text-white', compact && 'w-7 h-7')}
                    />
                </div>

                {!compact ? (
                    <CardTitle className="text-md md:text-base font-bold leading-tight z-10" style={{ color: text }}>
                        <h1>{achievement.name}</h1>
                    </CardTitle>
                ) : null}
            </CardHeader>

            <CardContent className={cn('flex-grow px-4 pt-0 z-10', !compact && 'pb-4', compact && 'text-center')}>
                {!compact ? (
                    <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-3 mt-2">
                        {achievement.description}
                    </CardDescription>
                ) : null}

                {achievement.xpBonus > 0 && !compact && (
                    <div
                        className={cn(
                            'text-xs font-bold mt-3 px-3 py-1 rounded-full w-fit transition-all duration-300',
                            isHovered && 'scale-105'
                        )}
                        style={{
                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                            color: 'white',
                            boxShadow: isHovered ? `0 3px 10px ${primary}50` : `0 2px 5px ${primary}30`,
                        }}
                    >
                        + {achievement.xpBonus} XP
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                    <TooltipContent
                        arrowClassName="bg-transparent fill-none"
                        className="p-0 overflow-hidden border-0 max-w-[250px] bg-background rounded-none"
                        style={{
                            background: `linear-gradient(135deg, ${primary}20, ${secondary}40)`,
                            borderImage: `linear-gradient(135deg, ${primary}, ${secondary}) 1`,
                            borderWidth: '2px',
                            borderStyle: 'solid',
                        }}
                    >
                        <div className="p-3">
                            <h4 className="font-bold mb-1" style={{ color: text }}>
                                {achievement.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                            {achievement.xpBonus > 0 && (
                                <div
                                    className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        color: 'white',
                                    }}
                                >
                                    + {achievement.xpBonus} XP
                                </div>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return cardContent;
};

export default AchievementItem;
