'use client';

import { useMemo } from 'react';

import { CheckCircle, Lock, Star } from 'lucide-react';

import AchievementIcon from '@/components/reusable/achievement-icon';
import { cn } from '@/lib/utils';
import { AchievementRarity, GlobalAchievementDTO } from '@/types';

import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AchievementItemProps {
    achievement: GlobalAchievementDTO;
    compact?: boolean;
}

const getRarityStyles = (rarity?: AchievementRarity | string, isEarned?: boolean, isLocked?: boolean) => {
    const baseHover = 'hover:shadow-lg hover:scale-[1.02]';
    const earnedOpacity = isEarned ? 'opacity-100' : 'opacity-70 group-hover:opacity-100';
    const lockedStyles = isLocked ? 'opacity-50 grayscale cursor-not-allowed !shadow-none !scale-100' : baseHover;

    let raritySpecificStyles = {
        cardBg: 'bg-card hover:bg-muted/50',
        border: 'border-border hover:border-foreground/30',
        iconWrapperBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
        titleColor: isEarned ? 'text-foreground' : 'text-muted-foreground',
        xpBadgeBg: 'bg-muted text-muted-foreground',
        categoryBadge: 'bg-secondary text-secondary-foreground',
    };

    switch (rarity) {
        case AchievementRarity.COMMON:
            raritySpecificStyles = {
                cardBg: 'bg-slate-500/5 dark:bg-slate-700/10',
                border: 'border-slate-500/20 hover:border-slate-500/40',
                iconWrapperBg: 'bg-slate-500/10 dark:bg-slate-700/20',
                iconColor: 'text-slate-500 dark:text-slate-400',
                titleColor: isEarned ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400',
                xpBadgeBg: 'bg-slate-500/80 text-white',
                categoryBadge: 'border-slate-500/30 text-slate-600 dark:text-slate-300 bg-slate-500/10',
            };
            break;
        case AchievementRarity.UNCOMMON:
            raritySpecificStyles = {
                cardBg: 'bg-green-500/5 dark:bg-green-600/10',
                border: 'border-green-500/30 hover:border-green-500/50',
                iconWrapperBg: 'bg-green-500/10 dark:bg-green-600/20',
                iconColor: 'text-green-500 dark:text-green-400',
                titleColor: isEarned ? 'text-green-700 dark:text-green-200' : 'text-green-500 dark:text-green-400',
                xpBadgeBg: 'bg-green-500/90 text-white',
                categoryBadge: 'border-green-500/30 text-green-600 dark:text-green-300 bg-green-500/10',
            };
            break;
        case AchievementRarity.RARE:
            raritySpecificStyles = {
                cardBg: 'bg-blue-500/5 dark:bg-blue-600/10',
                border: 'border-blue-500/30 hover:border-blue-500/50',
                iconWrapperBg: 'bg-blue-500/10 dark:bg-blue-600/20',
                iconColor: 'text-blue-500 dark:text-blue-400',
                titleColor: isEarned ? 'text-blue-700 dark:text-blue-200' : 'text-blue-500 dark:text-blue-400',
                xpBadgeBg: 'bg-blue-500/90 text-white',
                categoryBadge: 'border-blue-500/30 text-blue-600 dark:text-blue-300 bg-blue-500/10',
            };
            break;
        case AchievementRarity.EPIC:
            raritySpecificStyles = {
                cardBg: 'bg-purple-500/5 dark:bg-purple-600/10',
                border: 'border-purple-500/30 hover:border-purple-500/50',
                iconWrapperBg: 'bg-purple-500/10 dark:bg-purple-600/20',
                iconColor: 'text-purple-500 dark:text-purple-400',
                titleColor: isEarned ? 'text-purple-700 dark:text-purple-200' : 'text-purple-500 dark:text-purple-400',
                xpBadgeBg: 'bg-purple-500/90 text-white',
                categoryBadge: 'border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/10',
            };
            break;
        case AchievementRarity.LEGENDARY:
            raritySpecificStyles = {
                cardBg: 'bg-yellow-400/5 dark:bg-yellow-500/10 shadow-yellow-500/10 hover:shadow-yellow-500/20',
                border: 'border-yellow-500/30 hover:border-yellow-500/50',
                iconWrapperBg: 'bg-yellow-400/10 dark:bg-yellow-500/20',
                iconColor: 'text-yellow-500 dark:text-yellow-400',
                titleColor: isEarned ? 'text-yellow-600 dark:text-yellow-200' : 'text-yellow-500 dark:text-yellow-400',
                xpBadgeBg: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
                categoryBadge: 'border-yellow-500/30 text-yellow-600 dark:text-yellow-300 bg-yellow-400/10',
            };
            break;
    }
    return {
        ...raritySpecificStyles,
        cardDynamic: cn(raritySpecificStyles.cardBg, raritySpecificStyles.border, earnedOpacity, lockedStyles),
    };
};

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, compact = false }) => {
    const {
        name,
        description,
        iconUrl,
        xpBonus,
        isEarnedByUser,
        earnedAt,
        category,
        rarity,
        prerequisites = [],
    } = achievement;
    const isLockedByPrerequisites = useMemo(() => {
        if (isEarnedByUser || !prerequisites || prerequisites.length === 0) {
            return false;
        }
        return true;
    }, [isEarnedByUser, prerequisites]);

    const styles = getRarityStyles(rarity, isEarnedByUser, isLockedByPrerequisites);

    const earnedDateFormatted = earnedAt
        ? new Date(earnedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;

    const cardContent = (
        <div
            className={cn(
                'flex flex-col h-full overflow-hidden transition-all duration-300 rounded-xl shadow-sm p-4 relative group',
                styles.cardDynamic
            )}
        >
            {rarity === AchievementRarity.LEGENDARY && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <span className="absolute top-2 right-2 text-xs font-bold text-yellow-400/70 transform rotate-12">
                        LEGENDARY
                    </span>
                </div>
            )}
            {rarity === AchievementRarity.EPIC && (
                <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-purple-500/50 shadow-md"></div>
            )}

            <div className="flex items-start gap-3 mb-2">
                <div
                    className={cn(
                        'flex-shrink-0 p-2.5 rounded-lg border transition-all duration-300 group-hover:scale-105',
                        styles.iconWrapperBg,
                        isEarnedByUser ? 'border-current/30' : 'border-transparent opacity-80 group-hover:opacity-100'
                    )}
                >
                    <AchievementIcon iconName={iconUrl} className={cn('size-6', styles.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={cn('text-sm font-semibold line-clamp-2', styles.titleColor)}>{name}</h3>
                    {category && (
                        <Badge
                            variant={'outline'}
                            className={cn(
                                'text-[10px] px-1.5 py-0 mt-1 font-normal leading-tight',
                                styles.categoryBadge
                            )}
                        >
                            {category}
                        </Badge>
                    )}
                </div>
                {isLockedByPrerequisites && (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger className="absolute top-2 right-2 cursor-help">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Требуются другие достижения</p>
                                {/* TODO: Отобразить список пререквизитов, если allAchievementsMap передан */}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            <p
                className={cn(
                    'text-xs text-muted-foreground line-clamp-3 min-h-[42px] flex-grow',
                    isLockedByPrerequisites && 'blur-[1px]'
                )}
            >
                {description}
            </p>

            <div
                className="mt-3 pt-3 border-t flex justify-between items-center border-dashed"
                style={{ borderColor: styles.border.split(' ').pop()?.replace('hover:', '')?.replace('/30', '/15') }}
            >
                <Badge variant={'secondary'} className={cn('text-xs py-0.5 px-2', styles.xpBadgeBg)}>
                    <Star className="mr-1 h-3 w-3" />
                    {xpBonus} XP
                </Badge>
                {isEarnedByUser && earnedDateFormatted ? (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger className="flex items-center text-[10px] text-green-600 dark:text-green-400 cursor-default">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {earnedDateFormatted}
                            </TooltipTrigger>
                            <TooltipContent side="top">
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
                ) : (
                    !isEarnedByUser &&
                    !isLockedByPrerequisites && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 italic">Еще не получено</span>
                    )
                )}
            </div>
        </div>
    );

    return cardContent;
};

export default AchievementItem;
